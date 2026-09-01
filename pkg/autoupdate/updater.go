package autoupdate

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"dutix-gui/pkg/version"
)

// GitHubAsset represents a single release asset
type GitHubAsset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
	Size               int64  `json:"size"`
	ContentType        string `json:"content_type"`
}

// GitHubRelease represents release data from GitHub API
type GitHubRelease struct {
	TagName     string        `json:"tag_name"`
	Name        string        `json:"name"`
	Body        string        `json:"body"`
	HTMLURL     string        `json:"html_url"`
	PublishedAt time.Time     `json:"published_at"`
	Assets      []GitHubAsset `json:"assets"`
}

// UpdateCheckResult contains results of checking for updates
type UpdateCheckResult struct {
	UpdateAvailable bool   `json:"updateAvailable"`
	CurrentVersion  string `json:"currentVersion"`
	LatestVersion   string `json:"latestVersion"`
	ReleaseName     string `json:"releaseName"`
	ReleaseNotes    string `json:"releaseNotes"`
	ReleaseURL      string `json:"releaseUrl"`
	DownloadURL     string `json:"downloadUrl"`
	AssetSize       int64  `json:"assetSize"`
	PublishedAt     string `json:"publishedAt"`
}

// ProgressCallback reports download progress (percent 0-100 and status message)
type ProgressCallback func(percent float64, message string)

// Updater manages checking, downloading, and applying GUI app updates
type Updater struct {
	mu           sync.Mutex
	RepoOwner    string
	RepoName     string
	latestResult *UpdateCheckResult
	client       *http.Client
}

// NewUpdater creates a new Updater instance
func NewUpdater(owner, repo string) *Updater {
	return &Updater{
		RepoOwner: owner,
		RepoName:  repo,
		client:    &http.Client{Timeout: 30 * time.Second},
	}
}

// ParseSemver parses a version string (e.g. "1.0.1", "v1.2.0") into major, minor, patch ints
func ParseSemver(v string) (int, int, int, error) {
	v = strings.TrimSpace(v)
	v = strings.TrimPrefix(v, "v")
	v = strings.TrimPrefix(v, "V")

	// Cut off pre-release or build metadata (e.g. -alpha, +build)
	if idx := strings.IndexAny(v, "-+"); idx != -1 {
		v = v[:idx]
	}

	parts := strings.Split(v, ".")
	if len(parts) == 0 || parts[0] == "" {
		return 0, 0, 0, fmt.Errorf("invalid version string: %q", v)
	}

	var major, minor, patch int
	var err error

	major, err = strconv.Atoi(parts[0])
	if err != nil {
		return 0, 0, 0, fmt.Errorf("invalid major version in %q: %w", v, err)
	}

	if len(parts) > 1 && parts[1] != "" {
		minor, err = strconv.Atoi(parts[1])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid minor version in %q: %w", v, err)
		}
	}

	if len(parts) > 2 && parts[2] != "" {
		patch, err = strconv.Atoi(parts[2])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid patch version in %q: %w", v, err)
		}
	}

	return major, minor, patch, nil
}

// CompareVersions compares v1 and v2.
// Returns:
//
//	-1 if v1 < v2
//	 0 if v1 == v2
//	 1 if v1 > v2
func CompareVersions(v1, v2 string) (int, error) {
	maj1, min1, pat1, err1 := ParseSemver(v1)
	if err1 != nil {
		return 0, err1
	}
	maj2, min2, pat2, err2 := ParseSemver(v2)
	if err2 != nil {
		return 0, err2
	}

	if maj1 != maj2 {
		if maj1 < maj2 {
			return -1, nil
		}
		return 1, nil
	}

	if min1 != min2 {
		if min1 < min2 {
			return -1, nil
		}
		return 1, nil
	}

	if pat1 != pat2 {
		if pat1 < pat2 {
			return -1, nil
		}
		return 1, nil
	}

	return 0, nil
}

// CheckForUpdate queries GitHub API for the latest release and checks if a newer version is available
func (u *Updater) CheckForUpdate() (*UpdateCheckResult, error) {
	u.mu.Lock()
	defer u.mu.Unlock()

	currentVer := version.GetVersion()
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", u.RepoOwner, u.RepoName)

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("falha ao criar requisição para GitHub: %w", err)
	}
	req.Header.Set("User-Agent", "DutixGUI-AutoUpdater")
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := u.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar ao GitHub: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusNotFound {
			return &UpdateCheckResult{
				UpdateAvailable: false,
				CurrentVersion:  currentVer,
				LatestVersion:   currentVer,
			}, nil
		}
		return nil, fmt.Errorf("GitHub API retornou status %d", resp.StatusCode)
	}

	var rel GitHubRelease
	if err := json.NewDecoder(resp.Body).Decode(&rel); err != nil {
		return nil, fmt.Errorf("falha ao decodificar resposta da release: %w", err)
	}

	latestVer := strings.TrimPrefix(rel.TagName, "v")
	cmp, err := CompareVersions(currentVer, latestVer)
	if err != nil {
		return nil, fmt.Errorf("erro ao comparar versões (%s vs %s): %w", currentVer, latestVer, err)
	}

	updateAvailable := cmp < 0

	// Find the zip asset
	var downloadURL string
	var assetSize int64
	for _, asset := range rel.Assets {
		lowerName := strings.ToLower(asset.Name)
		if strings.HasSuffix(lowerName, ".zip") {
			// Prioritize Universal zip
			if strings.Contains(lowerName, "universal") || downloadURL == "" {
				downloadURL = asset.BrowserDownloadURL
				assetSize = asset.Size
			}
		}
	}

	publishedStr := ""
	if !rel.PublishedAt.IsZero() {
		publishedStr = rel.PublishedAt.Format("02/01/2006 15:04")
	}

	result := &UpdateCheckResult{
		UpdateAvailable: updateAvailable,
		CurrentVersion:  currentVer,
		LatestVersion:   latestVer,
		ReleaseName:     rel.Name,
		ReleaseNotes:    rel.Body,
		ReleaseURL:      rel.HTMLURL,
		DownloadURL:     downloadURL,
		AssetSize:       assetSize,
		PublishedAt:     publishedStr,
	}

	u.latestResult = result
	return result, nil
}

// DownloadAndExtract downloads the update ZIP and extracts the new .app bundle to a staging directory
func (u *Updater) DownloadAndExtract(progress ProgressCallback) (string, error) {
	u.mu.Lock()
	lastRes := u.latestResult
	u.mu.Unlock()

	var downloadURL string
	var assetSize int64

	if lastRes != nil && lastRes.DownloadURL != "" {
		downloadURL = lastRes.DownloadURL
		assetSize = lastRes.AssetSize
	} else {
		res, err := u.CheckForUpdate()
		if err != nil {
			return "", err
		}
		if res.DownloadURL == "" {
			return "", fmt.Errorf("nenhum arquivo .zip de atualização encontrado na release")
		}
		downloadURL = res.DownloadURL
		assetSize = res.AssetSize
	}

	if progress != nil {
		progress(5, "Iniciando download da atualização...")
	}

	// Download zip
	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Get(downloadURL)
	if err != nil {
		return "", fmt.Errorf("falha no download do pacote: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("download falhou com status %d", resp.StatusCode)
	}

	tempZipFile, err := os.CreateTemp("", "dutix-gui-update-*.zip")
	if err != nil {
		return "", fmt.Errorf("falha ao criar arquivo temporário: %w", err)
	}
	defer os.Remove(tempZipFile.Name())
	defer tempZipFile.Close()

	var downloaded int64
	buf := make([]byte, 64*1024)
	for {
		n, rErr := resp.Body.Read(buf)
		if n > 0 {
			if _, wErr := tempZipFile.Write(buf[:n]); wErr != nil {
				return "", fmt.Errorf("erro ao gravar dados baixados: %w", wErr)
			}
			downloaded += int64(n)
			if progress != nil && assetSize > 0 {
				p := 5.0 + (float64(downloaded)/float64(assetSize))*75.0
				progress(p, fmt.Sprintf("Baixando atualização: %.1f MB / %.1f MB", float64(downloaded)/(1024*1024), float64(assetSize)/(1024*1024)))
			}
		}
		if rErr != nil {
			if rErr == io.EOF {
				break
			}
			return "", rErr
		}
	}

	if progress != nil {
		progress(82, "Descompactando pacote do aplicativo...")
	}

	// Staging dir for extraction
	stagingDir, err := os.MkdirTemp("", "dutix-gui-stage-*")
	if err != nil {
		return "", fmt.Errorf("falha ao criar diretório de staging: %w", err)
	}

	// Extract zip
	extractedAppPath, err := extractZipApp(tempZipFile.Name(), stagingDir)
	if err != nil {
		os.RemoveAll(stagingDir)
		return "", fmt.Errorf("falha ao extrair pacote .app: %w", err)
	}

	if progress != nil {
		progress(95, "Validando permissões e atributos macOS...")
	}

	// Remove quarantine attribute if present
	_ = exec.Command("xattr", "-cr", extractedAppPath).Run()

	if progress != nil {
		progress(100, "Download e preparação concluídos com sucesso!")
	}

	return extractedAppPath, nil
}

// extractZipApp extracts the .app bundle from a zip archive
func extractZipApp(zipFilePath, destDir string) (string, error) {
	r, err := zip.OpenReader(zipFilePath)
	if err != nil {
		return "", err
	}
	defer r.Close()

	var foundAppPath string

	for _, f := range r.File {
		// Clean file path to prevent zip slip
		cleanPath := filepath.Clean(f.Name)
		if strings.HasPrefix(cleanPath, "..") || strings.HasPrefix(cleanPath, "/") {
			continue
		}

		targetPath := filepath.Join(destDir, cleanPath)

		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(targetPath, f.Mode()); err != nil {
				return "", err
			}
			if strings.HasSuffix(cleanPath, ".app") && foundAppPath == "" {
				foundAppPath = targetPath
			}
			continue
		}

		if err := os.MkdirAll(filepath.Dir(targetPath), 0755); err != nil {
			return "", err
		}

		// Handle symlinks if present in macOS bundles
		if f.Mode()&os.ModeSymlink != 0 {
			rc, err := f.Open()
			if err != nil {
				return "", err
			}
			linkTarget, err := io.ReadAll(rc)
			rc.Close()
			if err != nil {
				return "", err
			}
			_ = os.Remove(targetPath)
			_ = os.Symlink(string(linkTarget), targetPath)
			continue
		}

		outFile, err := os.OpenFile(targetPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return "", err
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			return "", err
		}

		_, err = io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
		if err != nil {
			return "", err
		}

		// Check if inside .app bundle
		if strings.Contains(cleanPath, ".app/") || strings.HasSuffix(cleanPath, ".app") {
			parts := strings.Split(cleanPath, ".app")
			if len(parts) > 0 {
				appRoot := filepath.Join(destDir, parts[0]+".app")
				if foundAppPath == "" {
					foundAppPath = appRoot
				}
			}
		}
	}

	if foundAppPath == "" {
		// Fallback: check if staging dir contains any .app
		entries, err := os.ReadDir(destDir)
		if err == nil {
			for _, e := range entries {
				if e.IsDir() && strings.HasSuffix(e.Name(), ".app") {
					foundAppPath = filepath.Join(destDir, e.Name())
					break
				}
			}
		}
	}

	if foundAppPath == "" {
		return "", fmt.Errorf("nenhum pacote .app encontrado no arquivo zip extraído")
	}

	return foundAppPath, nil
}

// GetCurrentAppBundlePath discovers the running macOS .app bundle directory
func GetCurrentAppBundlePath() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", err
	}

	// Follow symlinks if any
	resolvedPath, err := filepath.EvalSymlinks(execPath)
	if err == nil {
		execPath = resolvedPath
	}

	// Normal macOS bundle executable path:
	// /Applications/Dutix GUI.app/Contents/MacOS/dutix-gui
	if strings.Contains(execPath, ".app/Contents/MacOS") {
		idx := strings.Index(execPath, ".app")
		if idx != -1 {
			return execPath[:idx+4], nil
		}
	}

	return "", fmt.Errorf("o aplicativo não parece estar rodando dentro de um pacote .app padrão do macOS (%s)", execPath)
}

// ApplyUpdateAndRestart creates a detached updater script, replaces the current .app, and relaunches
func (u *Updater) ApplyUpdateAndRestart(newAppPath string) error {
	currentAppPath, err := GetCurrentAppBundlePath()
	if err != nil {
		return fmt.Errorf("não foi possível identificar o pacote .app em execução: %w", err)
	}

	if _, err := os.Stat(newAppPath); err != nil {
		return fmt.Errorf("pacote .app de atualização não encontrado em %s: %w", newAppPath, err)
	}

	currentPID := os.Getpid()

	// Create helper shell script to replace bundle and relaunch
	scriptContent := fmt.Sprintf(`#!/bin/sh
PID=%d
SRC_APP=%q
DEST_APP=%q

# Wait for the running application to exit
while kill -0 "$PID" 2>/dev/null; do
    sleep 0.2
done

# Replace bundle
rm -rf "$DEST_APP"
cp -R "$SRC_APP" "$DEST_APP"

# Clear quarantine attributes
xattr -cr "$DEST_APP" 2>/dev/null || true

# Reopen the updated app
open -n "$DEST_APP"

# Clean up temporary staging
rm -rf "$SRC_APP"
rm -f "$0"
`, currentPID, newAppPath, currentAppPath)

	scriptFile, err := os.CreateTemp("", "dutix-gui-relaunch-*.sh")
	if err != nil {
		return fmt.Errorf("falha ao criar script de reinicialização: %w", err)
	}

	if _, err := scriptFile.WriteString(scriptContent); err != nil {
		scriptFile.Close()
		os.Remove(scriptFile.Name())
		return fmt.Errorf("falha ao escrever script de reinicialização: %w", err)
	}
	scriptFile.Close()

	if err := os.Chmod(scriptFile.Name(), 0755); err != nil {
		os.Remove(scriptFile.Name())
		return fmt.Errorf("falha ao definir permissão de execução no script: %w", err)
	}

	// Spawn the detached shell command
	cmd := exec.Command("/bin/sh", scriptFile.Name())
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("falha ao disparar processo de atualização em segundo plano: %w", err)
	}

	return nil
}
