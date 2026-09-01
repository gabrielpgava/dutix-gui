package dutix

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"dutix-gui/pkg/logs"
)

type BinaryLocator interface {
	LocateBinary() (string, error)
}

type Executor struct {
	locator BinaryLocator
	logger  *logs.Logger
	mu      sync.Mutex
}

func NewExecutor(locator BinaryLocator, logger *logs.Logger) *Executor {
	return &Executor{
		locator: locator,
		logger:  logger,
	}
}

func (e *Executor) RunCommand(args ...string) ([]byte, []byte, int, int64, error) {
	binPath, err := e.locator.LocateBinary()
	if err != nil {
		return nil, nil, -1, 0, err
	}

	start := time.Now()
	cmd := exec.Command(binPath, args...)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()
	duration := time.Since(start).Milliseconds()

	exitCode := 0
	if cmd.ProcessState != nil {
		exitCode = cmd.ProcessState.ExitCode()
	} else if runErr != nil {
		exitCode = 1
	}

	stdoutBytes := stdout.Bytes()
	stderrBytes := stderr.Bytes()

	if e.logger != nil {
		e.logger.AddLog(logs.ExecutionLog{
			ID:         fmt.Sprintf("%d", time.Now().UnixNano()),
			Timestamp:  time.Now(),
			Command:    "dutix",
			Args:       args,
			Stdout:     string(stdoutBytes),
			Stderr:     string(stderrBytes),
			ExitCode:   exitCode,
			DurationMs: duration,
			Success:    runErr == nil,
		})
	}

	return stdoutBytes, stderrBytes, exitCode, duration, runErr
}

// ListApps returns installed applications
func (e *Executor) ListApps(filter string) ([]AppInfo, error) {
	args := []string{"apps", "list", "--output", "json"}
	if filter != "" {
		args = append(args, "--filter", filter)
	}

	stdout, stderr, exitCode, _, err := e.RunCommand(args...)
	if err != nil && exitCode != 0 {
		return nil, fmt.Errorf("falha ao listar apps: %s %s", string(stderr), err.Error())
	}

	return ParseJSON[[]AppInfo](stdout)
}

// ShowApp returns details for a specific application
func (e *Executor) ShowApp(appName string) (*AppDetail, error) {
	args := []string{"apps", "show", appName, "--output", "json"}
	stdout, stderr, exitCode, _, err := e.RunCommand(args...)
	if err != nil && exitCode != 0 {
		return nil, fmt.Errorf("falha ao exibir detalhes do app '%s': %s %s", appName, string(stderr), err.Error())
	}

	detail, parseErr := ParseJSON[AppDetail](stdout)
	if parseErr != nil {
		return nil, parseErr
	}
	return &detail, nil
}

// ListTargets returns targets and default handlers
func (e *Executor) ListTargets(pattern string) ([]TargetItem, error) {
	args := []string{"targets", "list", "-q", "--output", "json"}
	if pattern != "" {
		args = []string{"targets", "list", pattern, "-q", "--output", "json"}
	}

	stdout, stderr, exitCode, _, err := e.RunCommand(args...)
	if err != nil && exitCode != 0 {
		return nil, fmt.Errorf("falha ao listar alvos: %s %s", string(stderr), err.Error())
	}

	return ParseJSON[[]TargetItem](stdout)
}

// ShowTarget returns target handler details
func (e *Executor) ShowTarget(target string) (*TargetDetail, error) {
	args := []string{"targets", "show", target, "--output", "json"}
	stdout, stderr, exitCode, _, err := e.RunCommand(args...)
	if err != nil && exitCode != 0 {
		return nil, fmt.Errorf("falha ao inspecionar alvo '%s': %s %s", target, string(stderr), err.Error())
	}

	detail, parseErr := ParseJSON[TargetDetail](stdout)
	if parseErr != nil {
		return nil, parseErr
	}
	return &detail, nil
}

// SetHandler sets file associations for an application
func (e *Executor) SetHandler(appName string, extensions []string, utis []string, schemes []string, dryRun bool) (*DryRunResult, error) {
	args := []string{"set", appName}
	if len(extensions) > 0 {
		args = append(args, "--extensions", strings.Join(extensions, ","))
	}
	if len(utis) > 0 {
		args = append(args, "--utis", strings.Join(utis, ","))
	}
	if len(schemes) > 0 {
		args = append(args, "--schemes", strings.Join(schemes, ","))
	}

	if dryRun {
		args = append(args, "--dry-run")
	} else {
		args = append(args, "--yes")
	}

	stdout, stderr, exitCode, _, err := e.RunCommand(args...)
	combinedOutput := string(stdout)
	if len(stderr) > 0 {
		combinedOutput += "\n" + string(stderr)
	}

	if err != nil && exitCode != 0 {
		return nil, fmt.Errorf("erro ao definir associações: %s", combinedOutput)
	}

	result := ParseDryRunOutput(combinedOutput)
	return result, nil
}

// MigrateApps migrates file associations from one app to another
func (e *Executor) MigrateApps(fromApp string, toApp string, dryRun bool) (*DryRunResult, error) {
	args := []string{"apps", "migrate", fromApp, toApp}
	if dryRun {
		args = append(args, "--dry-run")
	} else {
		args = append(args, "--yes")
	}

	stdout, stderr, exitCode, _, err := e.RunCommand(args...)
	combinedOutput := string(stdout)
	if len(stderr) > 0 {
		combinedOutput += "\n" + string(stderr)
	}

	if err != nil && exitCode != 0 {
		return nil, fmt.Errorf("erro ao migrar apps (%s -> %s): %s", fromApp, toApp, combinedOutput)
	}

	result := ParseDryRunOutput(combinedOutput)
	return result, nil
}

// DetectConflicts checks target list for missing bundles or uninstalled applications
func (e *Executor) DetectConflicts() ([]ConflictItem, error) {
	targets, err := e.ListTargets("")
	if err != nil {
		return nil, err
	}

	conflicts := make([]ConflictItem, 0)
	checkedPaths := make(map[string]bool)

	for _, t := range targets {
		if t.DefaultApp == nil || t.DefaultApp.Path == "" {
			continue
		}

		appPath := t.DefaultApp.Path
		exists, checked := checkedPaths[appPath]
		if !checked {
			fi, statErr := os.Stat(appPath)
			exists = statErr == nil && fi.IsDir()
			checkedPaths[appPath] = exists
		}

		if !exists {
			conflicts = append(conflicts, ConflictItem{
				Extension:         t.Extension,
				UTI:               t.UTI,
				RegisteredAppName: t.DefaultApp.Name,
				RegisteredAppPath: appPath,
				AppExists:         false,
				IssueDescription:  fmt.Sprintf("O aplicativo registrado '%s' não existe mais no caminho '%s'", t.DefaultApp.Name, filepath.Clean(appPath)),
				Severity:          "error",
			})
		}
	}

	return conflicts, nil
}
