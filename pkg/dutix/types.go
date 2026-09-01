package dutix

import "time"

// AppInfo represents an installed macOS application
type AppInfo struct {
	Name     string `json:"name"`
	BundleID string `json:"bundle_id"`
	Path     string `json:"path"`
}

// TypeEntry represents a content type with UTIs and file extensions
type TypeEntry struct {
	Name       string   `json:"name"`
	UTIs       []string `json:"utis"`
	Extensions []string `json:"extensions"`
}

// AppDetail represents the detailed information returned by `dutix apps show`
type AppDetail struct {
	App            AppInfo     `json:"app"`
	DefaultTypes   []TypeEntry `json:"defaultTypes"`
	SupportedTypes []TypeEntry `json:"supportedTypes"`
	URLSchemes     []string    `json:"urlSchemes,omitempty"`
}

// TargetItem represents a single file extension and its resolved UTI and default app
type TargetItem struct {
	Extension  string   `json:"extension"`
	UTI        string   `json:"uti"`
	DefaultApp *AppInfo `json:"default_app,omitempty"`
}

// TargetIdentifier specifies target kind and id
type TargetIdentifier struct {
	Kind         string   `json:"kind"`
	Identifier   string   `json:"identifier"`
	Extension    string   `json:"extension,omitempty"`
	ResolvedUTIs []string `json:"resolvedUTIs,omitempty"`
}

// TargetDetail represents the detailed information returned by `dutix targets show`
type TargetDetail struct {
	Target        TargetIdentifier `json:"target"`
	DefaultApp    string           `json:"defaultApp"`
	ResolvedUTIs  []string         `json:"resolvedUTIs"`
	AvailableApps []string         `json:"availableApps"`
}

// DryRunItem represents a single planned association change
type DryRunItem struct {
	Target    string `json:"target"`
	Extension string `json:"extension"`
	Current   string `json:"current"`
	Desired   string `json:"desired"`
	Status    string `json:"status"` // pending, skipped, failed, success
}

// DryRunStats holds statistics for dry-run simulation
type DryRunStats struct {
	Pending int `json:"pending"`
	Success int `json:"success"`
	Failed  int `json:"failed"`
	Skipped int `json:"skipped"`
}

// DryRunResult represents the parsed output of dry-run execution
type DryRunResult struct {
	Header   string       `json:"header"`
	Items    []DryRunItem `json:"items"`
	Warnings []string     `json:"warnings"`
	Stats    DryRunStats  `json:"stats"`
	Raw      string       `json:"raw"`
	Success  bool         `json:"success"`
}

// ConflictItem represents an association issue (e.g., target points to uninstalled app)
type ConflictItem struct {
	Extension         string `json:"extension"`
	UTI               string `json:"uti"`
	RegisteredAppName string `json:"registered_app_name"`
	RegisteredAppPath string `json:"registered_app_path"`
	AppExists         bool   `json:"app_exists"`
	IssueDescription  string `json:"issue_description"`
	Severity          string `json:"severity"` // warning, error, info
}

// BinaryStatus describes the current dutix binary detection state
type BinaryStatus struct {
	Installed       bool      `json:"installed"`
	Path            string    `json:"path"`
	Version         string    `json:"version"`
	LatestVersion   string    `json:"latest_version"`
	UpdateAvailable bool      `json:"update_available"`
	Architecture    string    `json:"architecture"`
	LastChecked     time.Time `json:"last_checked"`
}
