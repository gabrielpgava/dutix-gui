package version

import "strings"

// Version is the current application version (can be overridden via ldflags)
var Version = "1.0.0"

// GitCommit is the commit hash at build time
var GitCommit = "dev"

// BuildDate is the date of build
var BuildDate = ""

// GetVersion returns the sanitized semantic version string
func GetVersion() string {
	return strings.TrimPrefix(Version, "v")
}

// GetFullVersion returns full formatted version info
func GetFullVersion() string {
	v := "v" + GetVersion()
	if GitCommit != "" && GitCommit != "dev" {
		v += " (" + GitCommit + ")"
	}
	return v
}
