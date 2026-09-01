package dutix

import (
	"testing"
)

func TestExtractJSON(t *testing.T) {
	cases := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "clean array",
			input:    `[{"name":"test"}]`,
			expected: `[{"name":"test"}]`,
		},
		{
			name:     "with CLI progress prefix",
			input:    "Scanning applications...\nResolved 10 entries.\n[{\"name\":\"test\"}]",
			expected: `[{"name":"test"}]`,
		},
		{
			name:     "clean object",
			input:    `{"app":{"name":"Safari"}}`,
			expected: `{"app":{"name":"Safari"}}`,
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := string(ExtractJSON([]byte(c.input)))
			if got != c.expected {
				t.Errorf("expected %s, got %s", c.expected, got)
			}
		})
	}
}

func TestParseDryRunOutput(t *testing.T) {
	raw := `Migrating file associations from Safari to Chrome

Target                                        Extension    Current             Desired  Status     
uti:public.css                                css          Firefox             Chrome   → pending  
uti:com.adobe.pdf                             pdf          Google Chrome       Chrome   skipped    

Warnings:
  ⚠  uti:dyn.age80k551r30g82pe: .download is not registered by any application (dynamic UTI); no default can be set

Stats: 1 pending, 0 success, 0 failed, 1 skipped

Dry run - no changes made.`

	result := ParseDryRunOutput(raw)
	if len(result.Items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(result.Items))
	}

	if result.Items[0].Target != "uti:public.css" || result.Items[0].Desired != "Chrome" || result.Items[0].Status != "pending" {
		t.Errorf("unexpected first item: %+v", result.Items[0])
	}

	if result.Items[1].Target != "uti:com.adobe.pdf" || result.Items[1].Status != "skipped" {
		t.Errorf("unexpected second item: %+v", result.Items[1])
	}

	if len(result.Warnings) != 1 {
		t.Fatalf("expected 1 warning, got %d", len(result.Warnings))
	}

	if result.Stats.Pending != 1 || result.Stats.Skipped != 1 {
		t.Errorf("unexpected stats: %+v", result.Stats)
	}
}
