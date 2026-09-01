package binary

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"dutix-gui/pkg/dutix"
)

type GitHubReleaseAsset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
	Size               int64  `json:"size"`
}

type GitHubRelease struct {
	TagName string               `json:"tag_name"`
	Name    string               `json:"name"`
	Body    string               `json:"body"`
	Assets  []GitHubReleaseAsset `json:"assets"`
}

type Manager struct {
	mu           sync.RWMutex
	customPath   string
	cachedStatus *dutix.BinaryStatus
}

func NewManager() *Manager {
	return &Manager{}
}

// GetApplicationSupportBinDir returns the path to the bundled bin directory in ~/Library/Application Support/DutixGUI/bin
func GetApplicationSupportBinDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(home, "Library", "Application Support", "DutixGUI", "bin")
	return dir, nil
}

// LocateBinary locates the dutix executable following priority rules
func (m *Manager) LocateBinary() (string, error) {
	m.mu.RLock()
	if m.customPath != "" {
		if fi, err := os.Stat(m.customPath); err == nil && !fi.IsDir() && fi.Mode()&0111 != 0 {
			path := m.customPath
			m.mu.RUnlock()
			return path, nil
		}
	}
	m.mu.RUnlock()

	home, _ := os.UserHomeDir()

	candidates := []string{
		"/opt/homebrew/bin/dutix",
		"/usr/local/bin/dutix",
	}

	if home != "" {
		candidates = append(candidates,
			filepath.Join(home, ".local", "bin", "dutix"),
			filepath.Join(home, "Library", "Application Support", "DutixGUI", "bin", "dutix"),
			filepath.Join(home, "go", "bin", "dutix"),
		)
	}

	for _, p := range candidates {
		if fi, err := os.Stat(p); err == nil && !fi.IsDir() && fi.Mode()&0111 != 0 {
			return p, nil
		}
	}

	// Try PATH
	if p, err := exec.LookPath("dutix"); err == nil {
		return p, nil
	}

	return "", fmt.Errorf("dutix binary not found in standard paths or $PATH")
}

// SetCustomPath sets a custom path override
func (m *Manager) SetCustomPath(path string) error {
	if path != "" {
		fi, err := os.Stat(path)
		if err != nil {
			return fmt.Errorf("invalid binary path: %w", err)
		}
		if fi.IsDir() {
			return fmt.Errorf("path is a directory, expected executable file")
		}
	}
	m.mu.Lock()
	m.customPath = path
	m.cachedStatus = nil
	m.mu.Unlock()
	return nil
}

// GetBinaryStatus returns full detection status
func (m *Manager) GetBinaryStatus() dutix.BinaryStatus {
	arch := runtime.GOARCH
	binPath, err := m.LocateBinary()
	if err != nil {
		return dutix.BinaryStatus{
			Installed:    false,
			Architecture: arch,
			LastChecked:  time.Now(),
		}
	}

	ver, _ := m.GetVersion(binPath)

	status := dutix.BinaryStatus{
		Installed:    true,
		Path:         binPath,
		Version:      ver,
		Architecture: arch,
		LastChecked:  time.Now(),
	}

	return status
}

// GetVersion queries `dutix version`
func (m *Manager) GetVersion(binaryPath string) (string, error) {
	cmd := exec.Command(binaryPath, "version")
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	raw := strings.TrimSpace(string(out))
	// Example: dutix 0.2.2 (448f828...) built on...
	parts := strings.Fields(raw)
	if len(parts) >= 2 && parts[0] == "dutix" {
		return parts[1], nil
	}
	return raw, nil
}

// CheckLatestRelease queries GitHub API for the latest release
func (m *Manager) CheckLatestRelease() (*GitHubRelease, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", "https://api.github.com/repos/jackchuka/dutix/releases/latest", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "DutixGUI-Updater")
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status %d", resp.StatusCode)
	}

	var release GitHubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, err
	}

	return &release, nil
}

// DownloadProgressCallback reports progress (0.0 to 100.0)
type DownloadProgressCallback func(percent float64, message string)

// DownloadAndInstall downloads and installs the latest or specified release binary
func (m *Manager) DownloadAndInstall(progress DownloadProgressCallback) (string, error) {
	if progress != nil {
		progress(5, "Verificando versão mais recente no GitHub...")
	}

	release, err := m.CheckLatestRelease()
	if err != nil {
		return "", fmt.Errorf("falha ao verificar versão no GitHub: %w", err)
	}

	arch := runtime.GOARCH
	expectedAssetName := fmt.Sprintf("dutix_%s_darwin_%s.tar.gz", strings.TrimPrefix(release.TagName, "v"), arch)

	var downloadURL string
	var assetSize int64
	for _, asset := range release.Assets {
		if asset.Name == expectedAssetName || strings.Contains(asset.Name, fmt.Sprintf("darwin_%s.tar.gz", arch)) {
			downloadURL = asset.BrowserDownloadURL
			assetSize = asset.Size
			break
		}
	}

	if downloadURL == "" {
		return "", fmt.Errorf("nenhum ativo compatível encontrado para darwin_%s na release %s", arch, release.TagName)
	}

	if progress != nil {
		progress(15, fmt.Sprintf("Baixando %s...", expectedAssetName))
	}

	// Download the tar.gz
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Get(downloadURL)
	if err != nil {
		return "", fmt.Errorf("falha no download: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("download falhou com status %d", resp.StatusCode)
	}

	targetDir, err := GetApplicationSupportBinDir()
	if err != nil {
		return "", err
	}
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("falha ao criar diretório %s: %w", targetDir, err)
	}

	tempFile, err := os.CreateTemp("", "dutix-download-*.tar.gz")
	if err != nil {
		return "", err
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	var downloaded int64
	buf := make([]byte, 32*1024)
	for {
		n, rErr := resp.Body.Read(buf)
		if n > 0 {
			if _, wErr := tempFile.Write(buf[:n]); wErr != nil {
				return "", wErr
			}
			downloaded += int64(n)
			if progress != nil && assetSize > 0 {
				p := 15.0 + (float64(downloaded)/float64(assetSize))*60.0
				progress(p, fmt.Sprintf("Baixando: %.1f MB / %.1f MB", float64(downloaded)/(1024*1024), float64(assetSize)/(1024*1024)))
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
		progress(80, "Extraindo binário...")
	}

	// Reset file offset
	if _, err := tempFile.Seek(0, 0); err != nil {
		return "", err
	}

	// Extract tar.gz
	gzr, err := gzip.NewReader(tempFile)
	if err != nil {
		return "", fmt.Errorf("falha ao descompactar gzip: %w", err)
	}
	defer gzr.Close()

	tr := tar.NewReader(gzr)
	destBinPath := filepath.Join(targetDir, "dutix")

	foundBinary := false
	for {
		header, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("erro ao ler arquivo tar: %w", err)
		}

		if header.Typeflag == tar.TypeReg && (header.Name == "dutix" || filepath.Base(header.Name) == "dutix") {
			// Write binary
			outBin, err := os.OpenFile(destBinPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0755)
			if err != nil {
				return "", fmt.Errorf("falha ao criar binário em %s: %w", destBinPath, err)
			}
			if _, err := io.Copy(outBin, tr); err != nil {
				outBin.Close()
				return "", err
			}
			outBin.Close()
			foundBinary = true
			break
		}
	}

	if !foundBinary {
		return "", fmt.Errorf("arquivo 'dutix' não encontrado no pacote baixado")
	}

	if err := os.Chmod(destBinPath, 0755); err != nil {
		return "", fmt.Errorf("falha ao definir permissão de execução: %w", err)
	}

	if progress != nil {
		progress(100, "Instalação concluída com sucesso!")
	}

	return destBinPath, nil
}
