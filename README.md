# Relay

**Ship tasks, not prompts.**

Relay is a lightweight AI task runner with a clean dashboard. Drop in a task, pick your agent, and let it commit or open a PR — while you do something else.

![Relay dashboard](https://raw.githubusercontent.com/aasm3535/relay/main/.github/media/preview.png)

> [!NOTE]
> Early-stage project. Expect rough edges.

---

## What it does

1. You create a task — title, description, repo path
2. Relay spawns an AI agent (Claude Code or Codex) in that repo
3. The agent implements the task and either:
   - **Auto mode** — commits and pushes directly to the current branch
   - **PR mode** — opens a Pull Request for review
4. The dashboard updates in real time — output, status, duration

No Linear. No subscriptions. No cloud. Just you, your repos, and an agent.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React + TypeScript + Zustand |
| Backend | Go + chi + gorilla/websocket |
| Database | SQLite (local, `~/.relay/relay.db`) |
| Realtime | WebSocket |

---

## Getting started

### Prerequisites

- [Go 1.22+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)
- At least one AI agent CLI in your `PATH`:
  - [`claude`](https://docs.anthropic.com/en/docs/claude-code) — Claude Code
  - [`codex`](https://github.com/openai/codex) — OpenAI Codex

### Run locally

```bash
git clone https://github.com/aasm3535/relay.git
cd relay

# Start backend + frontend together
npm run dev:full
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev:full` | Start backend + frontend in parallel |
| `npm run dev:front` | Frontend only (Vite dev server) |
| `npm run dev:back` | Backend only (Go) |
| `npm run build` | Production build for both |
| `npm run build:front` | Build frontend → `frontend/dist` |
| `npm run build:back` | Build backend binary → `bin/relay` |
| `npm run test:front` | TypeScript check + frontend build |
| `npm run test:back` | `go vet` + `go build` |

---

## Configuration

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Backend port |
| `RELAY_DATA_DIR` | `~/.relay` | Directory for SQLite database |

### Task options

**Agent** — which CLI to use:
- `claude` — runs `claude --print "<prompt>"`
- `codex` — runs `codex --quiet "<prompt>"`

**Mode** — what happens after the agent finishes:
- `auto` — commits and pushes to current branch, no review needed
- `pr` — creates a branch and opens a Pull Request

---

## Project structure

```
relay/
├── backend/
│   ├── main.go
│   └── internal/
│       ├── agent/     # Agent runner (claude / codex)
│       ├── api/       # HTTP handlers + WebSocket hub
│       └── db/        # SQLite layer
├── frontend/
│   └── src/
│       ├── components/  # Dashboard, TaskCard, TaskDetail, Modal
│       ├── store.ts     # Zustand store + WebSocket client
│       └── types.ts
└── package.json         # Root scripts
```

---

## Roadmap

- [ ] More agents (Gemini CLI, custom commands)
- [ ] Task scheduling / queue
- [ ] Neon (PostgreSQL) support for team use
- [ ] Task templates
- [ ] Webhook notifications on task complete

---

## Contributing

PRs are welcome. Open an issue first for bigger changes.

---

## License

[MIT](LICENSE)
