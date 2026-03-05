package agent

import (
	"os"
	"strings"
	"testing"
)

func TestStripEnv_RemovesClaudeCode(t *testing.T) {
	// Simulate env with CLAUDECODE set (like inside Claude Code session)
	t.Setenv("CLAUDECODE", "1")
	t.Setenv("CLAUDE_CODE_ENTRYPOINT", "cli")

	result := stripEnv("CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT", "CLAUDE_CODE_SESSION_ID")

	for _, e := range result {
		k := strings.SplitN(e, "=", 2)[0]
		if strings.EqualFold(k, "CLAUDECODE") {
			t.Errorf("CLAUDECODE still present: %s", e)
		}
		if strings.EqualFold(k, "CLAUDE_CODE_ENTRYPOINT") {
			t.Errorf("CLAUDE_CODE_ENTRYPOINT still present: %s", e)
		}
	}

	t.Logf("OK: stripped env has %d vars (original had %d)", len(result), len(os.Environ()))
}

func TestStripEnv_KeepsOtherVars(t *testing.T) {
	t.Setenv("PATH", os.Getenv("PATH"))
	result := stripEnv("CLAUDECODE")

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
