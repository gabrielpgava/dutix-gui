package presets

import (
	"testing"
)

func TestGetBuiltinPresets(t *testing.T) {
	presets := GetBuiltinPresets()
	if len(presets) < 4 {
		t.Fatalf("expected at least 4 builtin presets, got %d", len(presets))
	}

	foundWebDev := false
	for _, p := range presets {
		if p.ID == "web-developer" {
			foundWebDev = true
			if len(p.Mappings) == 0 {
				t.Errorf("web-developer preset should have mappings")
			}
		}
	}

	if !foundWebDev {
		t.Errorf("web-developer preset not found in builtins")
	}
}
