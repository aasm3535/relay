package agent

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

type RunConfig struct {
	TaskID      string
	Title       string
	Description string
	RepoPath    string
	Agent       string // claude | codex
	Mode        string // auto | pr
	OnOutput    func(chunk string)
	OnDone      func(err error)
}

func Run(ctx context.Context, cfg RunConfig) {
	go func() {
		err := run(ctx, cfg)
		cfg.OnDone(err)
	}()
}

func run(ctx context.Context, cfg RunConfig) error {
	prompt := buildPrompt(cfg)

	var cmd *exec.Cmd
	switch cfg.Agent {
	case "codex":
		cmd = exec.CommandContext(ctx, "codex", "exec", "--full-auto", prompt)
	default: // claude
		cmd = exec.CommandContext(ctx, "claude", "--print", "--dangerously-skip-permissions", prompt)
	}

	cmd.Dir = cfg.RepoPath
	cmd.Env = cleanEnv()

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("stdout pipe: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start agent: %w", err)
	}

	// Stream stdout
	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024)
	for scanner.Scan() {
		cfg.OnOutput(scanner.Text() + "\n")
	}

	// Capture stderr
	errScanner := bufio.NewScanner(stderr)
	for errScanner.Scan() {
		cfg.OnOutput("[stderr] " + errScanner.Text() + "\n")
	}

	return cmd.Wait()
}

// cleanEnv returns os.Environ() with all CLI session variables removed
// so that agent CLIs (claude, codex) can launch as fresh top-level sessions.
func cleanEnv() []string {
	// Prefixes that indicate a parent CLI session
	blockedPrefixes := []string{
		"CLAUDECODE",    // CLAUDECODE=1
		"CLAUDE_CODE_",  // CLAUDE_CODE_ENTRYPOINT, CLAUDE_CODE_SESSION_ID, etc.
		"CODEX_",        // Any codex session markers
	}
	// Exact names to block
	blockedExact := []string{
		"CLAUDE_CODE_ENTRYPOINT",
	}

	env := os.Environ()
	out := make([]string, 0, len(env))
	for _, e := range env {
		k := strings.SplitN(e, "=", 2)[0]
		upper := strings.ToUpper(k)

		blocked := false
		for _, prefix := range blockedPrefixes {
			if strings.HasPrefix(upper, prefix) {
				blocked = true
				break
			}
		}
		if !blocked {
			for _, exact := range blockedExact {
				if strings.EqualFold(k, exact) {
					blocked = true
					break
				}
			}
		}
		if !blocked {
			out = append(out, e)
		}
	}
	return out
}

func buildPrompt(cfg RunConfig) string {
	var sb strings.Builder

	sb.WriteString(fmt.Sprintf("Task: %s\n\n", cfg.Title))
	if cfg.Description != "" {
		sb.WriteString(fmt.Sprintf("Description:\n%s\n\n", cfg.Description))
	}

	switch cfg.Mode {
	case "pr":
		sb.WriteString(`Instructions:
1. Implement the task described above.
2. Create a new git branch with a descriptive name.
3. Commit your changes with a clear commit message.
4. Push the branch and create a Pull Request.
5. Report what you did and the PR URL.`)
	default: // auto
		sb.WriteString(`Instructions:
1. Implement the task described above.
2. Commit your changes directly to the current branch with a clear commit message.
3. Push to origin.
4. Report what you did.`)
	}

	return sb.String()
}
