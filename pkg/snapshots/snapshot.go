package snapshots

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"dutix-gui/pkg/dutix"
)

type Snapshot struct {
	ID          string             `json:"id"`
	Timestamp   time.Time          `json:"timestamp"`
	Description string             `json:"description"`
	TargetCount int                `json:"target_count"`
	Targets     []dutix.TargetItem `json:"targets"`
	CreatedBy   string             `json:"created_by"`
}

type RollbackReport struct {
	SnapshotID    string   `json:"snapshot_id"`
	TotalRestored int      `json:"total_restored"`
	FailedCount   int      `json:"failed_count"`
	Errors        []string `json:"errors"`
	Success       bool     `json:"success"`
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
	dir := filepath.Join(home, "Library", "Application Support", "DutixGUI", "snapshots")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("falha ao criar pasta de snapshots: %w", err)
	}
	return &Manager{storageDir: dir}, nil
}

// CreateSnapshot saves a snapshot of the current associations
func (m *Manager) CreateSnapshot(description string, targets []dutix.TargetItem, createdBy string) (*Snapshot, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := time.Now().Format("20060102-150405")
	if createdBy == "" {
		createdBy = "manual"
	}
	if description == "" {
		description = fmt.Sprintf("Snapshot %s (%d associações)", time.Now().Format("02/01/2006 15:04"), len(targets))
	}

	snap := &Snapshot{
		ID:          id,
		Timestamp:   time.Now(),
		Description: description,
		TargetCount: len(targets),
		Targets:     targets,
		CreatedBy:   createdBy,
	}

	filePath := filepath.Join(m.storageDir, fmt.Sprintf("snapshot-%s.json", id))
	bytes, err := json.MarshalIndent(snap, "", "  ")
	if err != nil {
		return nil, err
	}

	if err := os.WriteFile(filePath, bytes, 0644); err != nil {
		return nil, fmt.Errorf("erro ao salvar arquivo de snapshot: %w", err)
	}

	return snap, nil
}

// ListSnapshots returns all stored snapshots ordered by newest first
func (m *Manager) ListSnapshots() ([]Snapshot, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	entries, err := os.ReadDir(m.storageDir)
	if err != nil {
		return nil, err
	}

	snapshots := make([]Snapshot, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasPrefix(entry.Name(), "snapshot-") || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		filePath := filepath.Join(m.storageDir, entry.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		var s Snapshot
		if err := json.Unmarshal(data, &s); err == nil {
			snapshots = append(snapshots, s)
		}
	}

	sort.Slice(snapshots, func(i, j int) bool {
		return snapshots[i].Timestamp.After(snapshots[j].Timestamp)
	})

	return snapshots, nil
}

// GetSnapshot returns a single snapshot by ID
func (m *Manager) GetSnapshot(id string) (*Snapshot, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	filePath := filepath.Join(m.storageDir, fmt.Sprintf("snapshot-%s.json", id))
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("snapshot '%s' não encontrado", id)
	}

	var snap Snapshot
	if err := json.Unmarshal(data, &snap); err != nil {
		return nil, fmt.Errorf("erro ao decodificar snapshot: %w", err)
	}

	return &snap, nil
}

// DeleteSnapshot removes a snapshot file
func (m *Manager) DeleteSnapshot(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	filePath := filepath.Join(m.storageDir, fmt.Sprintf("snapshot-%s.json", id))
	return os.Remove(filePath)
}

// RestoreSnapshot restores associations from a snapshot using the dutix executor
func (m *Manager) RestoreSnapshot(id string, executor *dutix.Executor) (*RollbackReport, error) {
	snap, err := m.GetSnapshot(id)
	if err != nil {
		return nil, err
	}

	report := &RollbackReport{
		SnapshotID: id,
		Errors:     make([]string, 0),
		Success:    true,
	}

	// Group extensions by app name
	appExtensions := make(map[string][]string)
	for _, item := range snap.Targets {
		if item.DefaultApp != nil && item.DefaultApp.Name != "" && item.Extension != "" {
			appName := item.DefaultApp.Name
			appExtensions[appName] = append(appExtensions[appName], item.Extension)
		}
	}

	for appName, exts := range appExtensions {
		if len(exts) == 0 {
			continue
		}
		// Split into chunks of 30 extensions to avoid argument limits
		chunkSize := 30
		for i := 0; i < len(exts); i += chunkSize {
			end := i + chunkSize
			if end > len(exts) {
				end = len(exts)
			}
			chunk := exts[i:end]

			_, setErr := executor.SetHandler(appName, chunk, nil, nil, false)
			if setErr != nil {
				report.FailedCount += len(chunk)
				report.Errors = append(report.Errors, fmt.Sprintf("Falha ao restaurar %s para %s: %s", appName, strings.Join(chunk, ","), setErr.Error()))
			} else {
				report.TotalRestored += len(chunk)
			}
		}
	}

	if len(report.Errors) > 0 {
		report.Success = false
	}

	return report, nil
}
