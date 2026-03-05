package db

import (
	"database/sql"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Task struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	RepoPath    string     `json:"repo_path"`
	Agent       string     `json:"agent"`
	Mode        string     `json:"mode"`
	Status      string     `json:"status"`
	Output      string     `json:"output"`
	Error       string     `json:"error"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	StartedAt   *time.Time `json:"started_at"`
	FinishedAt  *time.Time `json:"finished_at"`
}

type DB struct {
	conn *sql.DB
}

func Open(path string) (*DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return nil, err
	}
	conn, err := sql.Open("sqlite3", path+"?_journal_mode=WAL&_foreign_keys=on")
	if err != nil {
		return nil, err
	}
	d := &DB{conn: conn}
	if err := d.migrate(); err != nil {
		return nil, err
	}
	return d, nil
}

func (d *DB) migrate() error {
	_, err := d.conn.Exec(`
		CREATE TABLE IF NOT EXISTS tasks (
			id          TEXT PRIMARY KEY,
			title       TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			repo_path   TEXT NOT NULL,
			agent       TEXT NOT NULL DEFAULT 'claude',
			mode        TEXT NOT NULL DEFAULT 'auto',
			status      TEXT NOT NULL DEFAULT 'pending',
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
	`)
	return err
}

func (d *DB) CreateTask(t *Task) error {
	_, err := d.conn.Exec(
		`INSERT INTO tasks (id, title, description, repo_path, agent, mode, status, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
		t.ID, t.Title, t.Description, t.RepoPath, t.Agent, t.Mode,
		t.CreatedAt, t.UpdatedAt,
	)
	return err
}

func (d *DB) GetTask(id string) (*Task, error) {
	row := d.conn.QueryRow(`SELECT * FROM tasks WHERE id = ?`, id)
	return scanTask(row)
}

func (d *DB) ListTasks() ([]*Task, error) {
	rows, err := d.conn.Query(`SELECT * FROM tasks ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*Task
	for rows.Next() {
		t, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

func (d *DB) UpdateTaskStatus(id, status, output, errMsg string) error {
	now := time.Now()
	var finishedAt *time.Time
	if status == "done" || status == "failed" {
		finishedAt = &now
	}
	_, err := d.conn.Exec(
		`UPDATE tasks SET status=?, output=?, error=?, updated_at=?, finished_at=? WHERE id=?`,
		status, output, errMsg, now, finishedAt, id,
	)
	return err
}

func (d *DB) SetTaskStarted(id string) error {
	now := time.Now()
	_, err := d.conn.Exec(
		`UPDATE tasks SET status='running', started_at=?, updated_at=? WHERE id=?`,
		now, now, id,
	)
	return err
}

func (d *DB) AppendOutput(id, chunk string) error {
	_, err := d.conn.Exec(
		`UPDATE tasks SET output=output||?, updated_at=? WHERE id=?`,
		chunk, time.Now(), id,
	)
	return err
}

func (d *DB) DeleteTask(id string) error {
	_, err := d.conn.Exec(`DELETE FROM tasks WHERE id=?`, id)
	return err
}

type scanner interface {
	Scan(dest ...any) error
}

func scanTask(s scanner) (*Task, error) {
	var t Task
	err := s.Scan(
		&t.ID, &t.Title, &t.Description, &t.RepoPath,
		&t.Agent, &t.Mode, &t.Status, &t.Output, &t.Error,
		&t.CreatedAt, &t.UpdatedAt, &t.StartedAt, &t.FinishedAt,
	)
	return &t, err
}
