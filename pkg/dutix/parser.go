package dutix

import (
	"bytes"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// ExtractJSON extracts valid JSON substring from mixed CLI output
func ExtractJSON(raw []byte) []byte {
	trimmed := bytes.TrimSpace(raw)
	if len(trimmed) == 0 {
		return nil
	}
	if (trimmed[0] == '{' && trimmed[len(trimmed)-1] == '}') || (trimmed[0] == '[' && trimmed[len(trimmed)-1] == ']') {
		return trimmed
	}

	firstBracket := bytes.IndexByte(trimmed, '[')
	lastBracket := bytes.LastIndexByte(trimmed, ']')
	firstBrace := bytes.IndexByte(trimmed, '{')
	lastBrace := bytes.LastIndexByte(trimmed, '}')

	if firstBracket != -1 && lastBracket > firstBracket {
		if firstBrace == -1 || firstBracket < firstBrace {
			return trimmed[firstBracket : lastBracket+1]
		}
	}

	if firstBrace != -1 && lastBrace > firstBrace {
		return trimmed[firstBrace : lastBrace+1]
	}

	return trimmed
}

// ParseJSON parses raw output into generic type T with JSON extraction fallback
func ParseJSON[T any](raw []byte) (T, error) {
	var result T
	clean := ExtractJSON(raw)
	if len(clean) == 0 {
		return result, fmt.Errorf("empty output")
	}

	if err := json.Unmarshal(clean, &result); err != nil {
		return result, fmt.Errorf("JSON parse error: %w (raw output: %s)", err, string(clean))
	}
	return result, nil
}

var (
	statsRegex   = regexp.MustCompile(`Stats:\s*(\d+)\s*pending,\s*(\d+)\s*success,\s*(\d+)\s*failed,\s*(\d+)\s*skipped`)
	warningRegex = regexp.MustCompile(`⚠\s*(.+)`)
)

// ParseDryRunOutput parses text output of dry run executions
func ParseDryRunOutput(raw string) *DryRunResult {
	lines := strings.Split(raw, "\n")
	result := &DryRunResult{
		Raw:      raw,
		Items:    make([]DryRunItem, 0),
		Warnings: make([]string, 0),
		Success:  true,
	}

	inTable := false
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}

		if strings.HasPrefix(trimmed, "Migrating file associations") || strings.HasPrefix(trimmed, "Application:") {
			result.Header = trimmed
			continue
		}

		if strings.HasPrefix(trimmed, "Target") && strings.Contains(trimmed, "Current") {
			inTable = true
			continue
		}

		if inTable && (strings.HasPrefix(trimmed, "uti:") || strings.HasPrefix(trimmed, "scheme:") || strings.HasPrefix(trimmed, "ext:")) {
			fields := strings.Fields(trimmed)
			if len(fields) >= 3 {
				item := DryRunItem{
					Target: fields[0],
				}

				// Find status at the end
				endIdx := len(fields) - 1
				if fields[endIdx] == "pending" && endIdx > 0 && (fields[endIdx-1] == "→" || fields[endIdx-1] == "->") {
					item.Status = "pending"
					endIdx -= 2
				} else {
					item.Status = strings.TrimPrefix(fields[endIdx], "→")
					item.Status = strings.TrimSpace(item.Status)
					endIdx--
				}

				// Desired app is at endIdx
				if endIdx >= 1 {
					item.Desired = fields[endIdx]
					endIdx--
				}

				// Check if fields[1] looks like an extension (no spaces, short, usually alphanumeric/special)
				// Remaining fields from startIdx to endIdx form Current App Name
				startIdx := 1
				// If there's enough fields and fields[1] doesn't look like an app name
				if endIdx >= 2 {
					item.Extension = fields[1]
					startIdx = 2
				}

				if endIdx >= startIdx {
					item.Current = strings.Join(fields[startIdx:endIdx+1], " ")
				}

				result.Items = append(result.Items, item)
			}
			continue
		}

		if strings.HasPrefix(trimmed, "Stats:") {
			inTable = false
			matches := statsRegex.FindStringSubmatch(trimmed)
			if len(matches) == 5 {
				p, _ := strconv.Atoi(matches[1])
				s, _ := strconv.Atoi(matches[2])
				f, _ := strconv.Atoi(matches[3])
				sk, _ := strconv.Atoi(matches[4])
				result.Stats = DryRunStats{
					Pending: p,
					Success: s,
					Failed:  f,
					Skipped: sk,
				}
			}
			continue
		}

		if strings.Contains(trimmed, "⚠") {
			matches := warningRegex.FindStringSubmatch(trimmed)
			if len(matches) == 2 {
				result.Warnings = append(result.Warnings, strings.TrimSpace(matches[1]))
			} else {
				result.Warnings = append(result.Warnings, trimmed)
			}
		}
	}

	if result.Stats.Pending == 0 && result.Stats.Success == 0 && len(result.Items) > 0 {
		for _, item := range result.Items {
			switch strings.ToLower(item.Status) {
			case "pending", "→ pending":
				result.Stats.Pending++
			case "success", "✓", "ok":
				result.Stats.Success++
			case "failed", "error":
				result.Stats.Failed++
			case "skipped":
				result.Stats.Skipped++
			}
		}
	}

	return result
}
