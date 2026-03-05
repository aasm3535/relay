package agent

import (
	"bufio"
	"context"
	"fmt"
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
		cmd = exec.CommandContext(ctx, "codex", "--quiet", prompt)
	default: // claude
		cmd = exec.CommandContext(ctx, "claude", "--print", prompt)
	}

	cmd.Dir = cfg.RepoPath

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

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Text() + "\n"
		cfg.OnOutput(line)
	}

	errScanner := bufio.NewScanner(stderr)
	for errScanner.Scan() {
		cfg.OnOutput("[stderr] " + errScanner.Text() + "\n")
	}

	return cmd.Wait()
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
