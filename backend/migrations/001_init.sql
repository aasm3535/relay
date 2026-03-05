CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    repo_path   TEXT NOT NULL,
    agent       TEXT NOT NULL DEFAULT 'claude', -- claude | codex
    mode        TEXT NOT NULL DEFAULT 'auto',   -- auto | pr
    status      TEXT NOT NULL DEFAULT 'pending', -- pending | running | done | failed
    output      TEXT NOT NULL DEFAULT '',
    error       TEXT NOT NULL DEFAULT '',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at  DATETIME,
    finished_at DATETIME
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
    ('default_agent', 'claude'),
    ('default_mode', 'auto');
