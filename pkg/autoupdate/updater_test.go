package autoupdate

import (
	"testing"
)

func TestParseSemver(t *testing.T) {
	tests := []struct {
		input       string
		wantMaj     int
		wantMin     int
		wantPat     int
		expectError bool
	}{
		{"1.0.0", 1, 0, 0, false},
		{"v1.0.1", 1, 0, 1, false},
		{"V2.3.4", 2, 3, 4, false},
		{"1.2", 1, 2, 0, false},
		{"1", 1, 0, 0, false},
		{"1.0.0-beta.1", 1, 0, 0, false},
		{"v1.0.2+20260901", 1, 0, 2, false},
		{"invalid", 0, 0, 0, true},
		{"", 0, 0, 0, true},
	}

	for _, tt := range tests {
		maj, min, pat, err := ParseSemver(tt.input)
		if (err != nil) != tt.expectError {
			t.Errorf("ParseSemver(%q) error = %v, expectError %v", tt.input, err, tt.expectError)
			continue
		}
		if !tt.expectError {
			if maj != tt.wantMaj || min != tt.wantMin || pat != tt.wantPat {
				t.Errorf("ParseSemver(%q) = (%d, %d, %d), want (%d, %d, %d)", tt.input, maj, min, pat, tt.wantMaj, tt.wantMin, tt.wantPat)
			}
		}
	}
}

func TestCompareVersions(t *testing.T) {
	tests := []struct {
		v1          string
		v2          string
		want        int
		expectError bool
	}{
		{"1.0.0", "1.0.1", -1, false},
		{"v1.0.1", "1.0.0", 1, false},
		{"1.0.0", "1.0.0", 0, false},
		{"v1.0.0", "1.0.0", 0, false},
		{"1.0.0", "1.1.0", -1, false},
		{"1.2.0", "1.1.9", 1, false},
		{"2.0.0", "1.99.99", 1, false},
		{"0.9.9", "1.0.0", -1, false},
		{"v1.0.1-beta", "v1.0.1", 0, false},
		{"invalid", "1.0.0", 0, true},
	}

	for _, tt := range tests {
		got, err := CompareVersions(tt.v1, tt.v2)
		if (err != nil) != tt.expectError {
			t.Errorf("CompareVersions(%q, %q) error = %v, expectError %v", tt.v1, tt.v2, err, tt.expectError)
			continue
		}
		if !tt.expectError && got != tt.want {
			t.Errorf("CompareVersions(%q, %q) = %d, want %d", tt.v1, tt.v2, got, tt.want)
		}
	}
}
