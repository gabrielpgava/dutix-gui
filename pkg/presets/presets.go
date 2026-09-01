package presets

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type AppTargetMapping struct {
	AppName    string   `json:"app_name" yaml:"app_name"`
	Extensions []string `json:"extensions" yaml:"extensions"`
	UTIs       []string `json:"utis,omitempty" yaml:"utis,omitempty"`
	Schemes    []string `json:"schemes,omitempty" yaml:"schemes,omitempty"`
}

type Preset struct {
	ID          string             `json:"id" yaml:"id"`
	Name        string             `json:"name" yaml:"name"`
	Description string             `json:"description" yaml:"description"`
	Category    string             `json:"category" yaml:"category"`
	Icon        string             `json:"icon" yaml:"icon"`
	IsBuiltin   bool               `json:"is_builtin" yaml:"is_builtin"`
	Mappings    []AppTargetMapping `json:"mappings" yaml:"mappings"`
}

type Manager struct {
	storageDir string
	mu         sync.RWMutex
}

func NewManager() (*Manager, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(home, "Library", "Application Support", "DutixGUI", "presets")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("falha ao criar pasta de presets: %w", err)
	}
	return &Manager{storageDir: dir}, nil
}

func GetBuiltinPresets() []Preset {
	return []Preset{
		{
			ID:          "web-developer",
			Name:        "Web Developer Suite",
			Description: "Associa arquivos de código e web ao Visual Studio Code, URLs ao Google Chrome e terminal ao iTerm/Terminal.",
			Category:    "Desenvolvimento",
			Icon:        "Code2",
			IsBuiltin:   true,
			Mappings: []AppTargetMapping{
				{
					AppName:    "Visual Studio Code",
					Extensions: []string{"js", "ts", "jsx", "tsx", "json", "html", "css", "scss", "md", "yaml", "yml", "py", "go", "rs", "sql", "sh", "env", "toml"},
					UTIs:       []string{"public.plain-text", "public.json", "public.source-code"},
				},
				{
					AppName: "Google Chrome",
					Schemes: []string{"http", "https"},
				},
			},
		},
		{
			ID:          "designer-media",
			Name:        "Designer & Criativo",
			Description: "Associa arquivos gráficos e mídias vetoriais/raster ao Affinity, Figma e navegadores modernos.",
			Category:    "Design",
			Icon:        "Palette",
			IsBuiltin:   true,
			Mappings: []AppTargetMapping{
				{
					AppName:    "Affinity",
					Extensions: []string{"png", "jpg", "jpeg", "svg", "svgz", "webp", "ai", "psd", "tiff", "tif", "ico"},
				},
				{
					AppName:    "Preview",
					Extensions: []string{"pdf"},
				},
			},
		},
		{
			ID:          "media-audiovideo",
			Name:        "Mídia, Áudio & Vídeo",
			Description: "Configura o VLC / IINA como reprodutor principal para formatos de vídeo e áudio.",
			Category:    "Mídia",
			Icon:        "Film",
			IsBuiltin:   true,
			Mappings: []AppTargetMapping{
				{
					AppName:    "VLC",
					Extensions: []string{"mp4", "mkv", "avi", "mov", "webm", "mp3", "flac", "wav", "m4a", "ogg", "aac"},
				},
			},
		},
		{
			ID:          "minimal-apple",
			Name:        "Apple Native Minimalist",
			Description: "Restaura os aplicativos nativos do macOS (Safari, Preview, TextEdit, QuickTime) para máxima integração.",
			Category:    "Sistema",
			Icon:        "Apple",
			IsBuiltin:   true,
			Mappings: []AppTargetMapping{
				{
					AppName:    "Safari",
					Schemes:    []string{"http", "https"},
					Extensions: []string{"html", "htm", "webloc"},
				},
				{
					AppName:    "Preview",
					Extensions: []string{"pdf", "png", "jpg", "jpeg"},
				},
				{
					AppName:    "TextEdit",
					Extensions: []string{"txt", "rtf", "md"},
				},
			},
		},
	}
}

// ListPresets returns both built-in presets and user-saved presets
func (m *Manager) ListPresets() ([]Preset, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	presets := GetBuiltinPresets()

	entries, err := os.ReadDir(m.storageDir)
	if err != nil {
		return presets, nil
	}

	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		filePath := filepath.Join(m.storageDir, entry.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		var p Preset
		if err := json.Unmarshal(data, &p); err == nil {
			p.IsBuiltin = false
			presets = append(presets, p)
		}
	}

	return presets, nil
}

// SaveUserPreset saves or updates a custom preset
func (m *Manager) SaveUserPreset(preset Preset) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if preset.ID == "" {
		preset.ID = fmt.Sprintf("custom-%d", len(preset.Name))
	}
	preset.IsBuiltin = false

	filePath := filepath.Join(m.storageDir, fmt.Sprintf("%s.json", preset.ID))
	data, err := json.MarshalIndent(preset, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(filePath, data, 0644)
}

// DeleteUserPreset removes a custom preset
func (m *Manager) DeleteUserPreset(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	filePath := filepath.Join(m.storageDir, fmt.Sprintf("%s.json", id))
	return os.Remove(filePath)
}

// ExportPresetJSON exports a preset as JSON string
func (m *Manager) ExportPresetJSON(preset Preset) (string, error) {
	data, err := json.MarshalIndent(preset, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// ImportPresetJSON imports a preset from JSON string
func (m *Manager) ImportPresetJSON(jsonStr string) (*Preset, error) {
	var preset Preset
	if err := json.Unmarshal([]byte(jsonStr), &preset); err != nil {
		return nil, fmt.Errorf("JSON de preset inválido: %w", err)
	}
	preset.IsBuiltin = false
	if err := m.SaveUserPreset(preset); err != nil {
		return nil, err
	}
	return &preset, nil
}
