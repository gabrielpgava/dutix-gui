package main

import (
	"context"
	"fmt"
	"strings"
	"time"

	"dutix-gui/pkg/autoupdate"
	"dutix-gui/pkg/binary"
	"dutix-gui/pkg/dutix"
	"dutix-gui/pkg/logs"
	"dutix-gui/pkg/presets"
	"dutix-gui/pkg/snapshots"
	"dutix-gui/pkg/version"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct encapsulates services and context
type App struct {
	ctx          context.Context
	binaryMgr    *binary.Manager
	logger       *logs.Logger
	executor     *dutix.Executor
	snapshotMgr  *snapshots.Manager
	presetMgr    *presets.Manager
	updater      *autoupdate.Updater
}

// NewApp creates a new App application struct
func NewApp() *App {
	binMgr := binary.NewManager()
	logger := logs.NewLogger(250)
	executor := dutix.NewExecutor(binMgr, logger)
	snapMgr, _ := snapshots.NewManager()
	presetMgr, _ := presets.NewManager()
	updater := autoupdate.NewUpdater("gabrielpgava", "dutix-gui")

	return &App{
		binaryMgr:   binMgr,
		logger:      logger,
		executor:    executor,
		snapshotMgr: snapMgr,
		presetMgr:   presetMgr,
		updater:     updater,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetAppVersion returns the current version of the Dutix GUI application
func (a *App) GetAppVersion() string {
	return version.GetVersion()
}

// GetBinaryStatus returns current binary status
func (a *App) GetBinaryStatus() dutix.BinaryStatus {
	return a.binaryMgr.GetBinaryStatus()
}

// SetCustomBinaryPath allows setting a specific path for the dutix executable
func (a *App) SetCustomBinaryPath(path string) error {
	return a.binaryMgr.SetCustomPath(path)
}

// CheckForUpdates checks GitHub releases for a newer version
func (a *App) CheckForUpdates() (*binary.GitHubRelease, error) {
	return a.binaryMgr.CheckLatestRelease()
}

// DownloadAndInstallBinary downloads and installs the latest binary release
func (a *App) DownloadAndInstallBinary() (string, error) {
	progressCallback := func(percent float64, message string) {
		runtime.EventsEmit(a.ctx, "binary:download-progress", map[string]interface{}{
			"percent": percent,
			"message": message,
		})
	}
	return a.binaryMgr.DownloadAndInstall(progressCallback)
}

// ListApps returns installed applications matching filter
func (a *App) ListApps(filter string) ([]dutix.AppInfo, error) {
	return a.executor.ListApps(filter)
}

// ShowApp returns details for a specific application
func (a *App) ShowApp(appName string) (*dutix.AppDetail, error) {
	return a.executor.ShowApp(appName)
}

// ListTargets returns targets and default handlers
func (a *App) ListTargets(pattern string) ([]dutix.TargetItem, error) {
	return a.executor.ListTargets(pattern)
}

// ShowTarget returns target handler details
func (a *App) ShowTarget(target string) (*dutix.TargetDetail, error) {
	return a.executor.ShowTarget(target)
}

// DetectConflicts checks target list for missing bundles or uninstalled applications
func (a *App) DetectConflicts() ([]dutix.ConflictItem, error) {
	return a.executor.DetectConflicts()
}

// SetHandler sets file associations for an application
func (a *App) SetHandler(appName string, extensions []string, utis []string, schemes []string, dryRun bool) (*dutix.DryRunResult, error) {
	// Automatically create a safety snapshot before modifying associations if not dry-run
	if !dryRun && a.snapshotMgr != nil {
		targets, _ := a.executor.ListTargets("")
		if len(targets) > 0 {
			a.snapshotMgr.CreateSnapshot(fmt.Sprintf("Auto-Snapshot antes de configurar '%s'", appName), targets, "auto-set")
		}
	}
	return a.executor.SetHandler(appName, extensions, utis, schemes, dryRun)
}

// MigrateApps migrates file associations from one app to another
func (a *App) MigrateApps(fromApp string, toApp string, dryRun bool) (*dutix.DryRunResult, error) {
	// Automatically create a safety snapshot before migration if not dry-run
	if !dryRun && a.snapshotMgr != nil {
		targets, _ := a.executor.ListTargets("")
		if len(targets) > 0 {
			a.snapshotMgr.CreateSnapshot(fmt.Sprintf("Auto-Snapshot antes de migrar '%s' para '%s'", fromApp, toApp), targets, "auto-migrate")
		}
	}
	return a.executor.MigrateApps(fromApp, toApp, dryRun)
}

// ListPresets returns all presets (built-in and custom)
func (a *App) ListPresets() ([]presets.Preset, error) {
	if a.presetMgr == nil {
		return presets.GetBuiltinPresets(), nil
	}
	return a.presetMgr.ListPresets()
}

// SavePreset saves or updates a preset
func (a *App) SavePreset(preset presets.Preset) error {
	if a.presetMgr == nil {
		return fmt.Errorf("preset manager not initialized")
	}
	return a.presetMgr.SaveUserPreset(preset)
}

// DeletePreset deletes a custom preset
func (a *App) DeletePreset(id string) error {
	if a.presetMgr == nil {
		return fmt.Errorf("preset manager not initialized")
	}
	return a.presetMgr.DeleteUserPreset(id)
}

// ApplyPreset applies a full preset configuration
func (a *App) ApplyPreset(preset presets.Preset, dryRun bool) ([]*dutix.DryRunResult, error) {
	if !dryRun && a.snapshotMgr != nil {
		targets, _ := a.executor.ListTargets("")
		if len(targets) > 0 {
			a.snapshotMgr.CreateSnapshot(fmt.Sprintf("Auto-Snapshot antes de aplicar preset '%s'", preset.Name), targets, "auto-preset")
		}
	}

	results := make([]*dutix.DryRunResult, 0, len(preset.Mappings))
	var errorList []string

	for _, mapping := range preset.Mappings {
		if mapping.AppName == "" {
			continue
		}
		res, err := a.executor.SetHandler(mapping.AppName, mapping.Extensions, mapping.UTIs, mapping.Schemes, dryRun)
		if err != nil {
			errorList = append(errorList, fmt.Sprintf("%s: %s", mapping.AppName, err.Error()))
		}
		if res != nil {
			results = append(results, res)
		}
	}

	if len(errorList) > 0 {
		return results, fmt.Errorf("alguns itens falharam: %s", strings.Join(errorList, "; "))
	}

	return results, nil
}

// ExportPresetJSON returns JSON string of preset
func (a *App) ExportPresetJSON(preset presets.Preset) (string, error) {
	if a.presetMgr == nil {
		return "", fmt.Errorf("preset manager not initialized")
	}
	return a.presetMgr.ExportPresetJSON(preset)
}

// ImportPresetJSON imports preset from JSON
func (a *App) ImportPresetJSON(jsonStr string) (*presets.Preset, error) {
	if a.presetMgr == nil {
		return nil, fmt.Errorf("preset manager not initialized")
	}
	return a.presetMgr.ImportPresetJSON(jsonStr)
}

// CreateSnapshot creates a manual snapshot of current associations
func (a *App) CreateSnapshot(description string) (*snapshots.Snapshot, error) {
	if a.snapshotMgr == nil {
		return nil, fmt.Errorf("snapshot manager not initialized")
	}
	targets, err := a.executor.ListTargets("")
	if err != nil {
		return nil, fmt.Errorf("falha ao ler estado atual dos alvos: %w", err)
	}
	return a.snapshotMgr.CreateSnapshot(description, targets, "manual")
}

// ListSnapshots returns all stored snapshots
func (a *App) ListSnapshots() ([]snapshots.Snapshot, error) {
	if a.snapshotMgr == nil {
		return nil, fmt.Errorf("snapshot manager not initialized")
	}
	return a.snapshotMgr.ListSnapshots()
}

// GetSnapshot returns a single snapshot
func (a *App) GetSnapshot(id string) (*snapshots.Snapshot, error) {
	if a.snapshotMgr == nil {
		return nil, fmt.Errorf("snapshot manager not initialized")
	}
	return a.snapshotMgr.GetSnapshot(id)
}

// DeleteSnapshot deletes a snapshot
func (a *App) DeleteSnapshot(id string) error {
	if a.snapshotMgr == nil {
		return fmt.Errorf("snapshot manager not initialized")
	}
	return a.snapshotMgr.DeleteSnapshot(id)
}

// RestoreSnapshot restores all associations recorded in a snapshot
func (a *App) RestoreSnapshot(id string) (*snapshots.RollbackReport, error) {
	if a.snapshotMgr == nil {
		return nil, fmt.Errorf("snapshot manager not initialized")
	}
	return a.snapshotMgr.RestoreSnapshot(id, a.executor)
}

// GetLogs returns CLI execution logs
func (a *App) GetLogs() []logs.ExecutionLog {
	if a.logger == nil {
		return []logs.ExecutionLog{}
	}
	return a.logger.GetLogs()
}

// ClearLogs clears execution logs
func (a *App) ClearLogs() {
	if a.logger != nil {
		a.logger.Clear()
	}
}

// CheckForAppUpdate checks for new releases of Dutix GUI on GitHub
func (a *App) CheckForAppUpdate() (*autoupdate.UpdateCheckResult, error) {
	if a.updater == nil {
		return nil, fmt.Errorf("updater not initialized")
	}
	return a.updater.CheckForUpdate()
}

// DownloadAppUpdate downloads and stages the newest app update
func (a *App) DownloadAppUpdate() (string, error) {
	if a.updater == nil {
		return "", fmt.Errorf("updater not initialized")
	}
	progressCallback := func(percent float64, message string) {
		runtime.EventsEmit(a.ctx, "autoupdate:download-progress", map[string]interface{}{
			"percent": percent,
			"message": message,
		})
	}
	return a.updater.DownloadAndExtract(progressCallback)
}

// ApplyAppUpdateAndRestart triggers the helper script to replace the .app and relaunch it
func (a *App) ApplyAppUpdateAndRestart(newAppPath string) error {
	if a.updater == nil {
		return fmt.Errorf("updater not initialized")
	}
	err := a.updater.ApplyUpdateAndRestart(newAppPath)
	if err != nil {
		return err
	}
	// Exit the current app so the helper script can replace it and relaunch
	go func() {
		time.Sleep(500 * time.Millisecond)
		runtime.Quit(a.ctx)
	}()
	return nil
}

