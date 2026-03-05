package agent

import (
	"os"
	"strings"
	"testing"
)

func TestCleanEnv_RemovesClaudeCode(t *testing.T) {
	t.Setenv("CLAUDECODE", "1")
	t.Setenv("CLAUDE_CODE_ENTRYPOINT", "cli")
	t.Setenv("CLAUDE_CODE_SESSION_ID", "abc123")

	result := cleanEnv()

	for _, e := range result {
		k := strings.SplitN(e, "=", 2)[0]
		upper := strings.ToUpper(k)
		if upper == "CLAUDECODE" || strings.HasPrefix(upper, "CLAUDE_CODE_") {
			t.Errorf("should be stripped but still present: %s", k)
		}
	}

	t.Logf("OK: cleaned env has %d vars (original had %d)", len(result), len(os.Environ()))
}

func TestCleanEnv_RemovesCodex(t *testing.T) {
	t.Setenv("CODEX_SESSION", "1")

	result := cleanEnv()

	for _, e := range result {
		k := strings.SplitN(e, "=", 2)[0]
		if strings.HasPrefix(strings.ToUpper(k), "CODEX_") {
			t.Errorf("should be stripped but still present: %s", k)
		}
	}
}

func TestCleanEnv_KeepsOtherVars(t *testing.T) {
	t.Setenv("PATH", os.Getenv("PATH"))
	result := cleanEnv()

	hasPath := false
	for _, e := range result {
		if strings.HasPrefix(e, "PATH=") {
			hasPath = true
			break
		}
	}
	if !hasPath {
		t.Error("PATH was accidentally stripped")
	}
}
