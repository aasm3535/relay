package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/relay/backend/internal/agent"
	"github.com/relay/backend/internal/db"
)

type Server struct {
	db  *db.DB
	hub *Hub
}

func NewServer(database *db.DB, hub *Hub) *Server {
	return &Server{db: database, hub: hub}
}

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(corsMiddleware)

	r.Get("/ws", s.hub.HandleWS)
	r.Get("/api/tasks", s.listTasks)
	r.Post("/api/tasks", s.createTask)
	r.Delete("/api/tasks/{id}", s.deleteTask)
	r.Post("/api/tasks/{id}/retry", s.retryTask)

	return r
}

func (s *Server) listTasks(w http.ResponseWriter, r *http.Request) {
	tasks, err := s.db.ListTasks()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if tasks == nil {
		tasks = []*db.Task{}
	}
	writeJSON(w, tasks)
}

type createTaskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	RepoPath    string `json:"repo_path"`
	Agent       string `json:"agent"`
	Mode        string `json:"mode"`
}

func (s *Server) createTask(w http.ResponseWriter, r *http.Request) {
	var req createTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", 400)
		return
	}
	if strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.RepoPath) == "" {
		http.Error(w, "title and repo_path are required", 400)
		return
	}
	if req.Agent == "" {
		req.Agent = "claude"
	}
	if req.Mode == "" {
		req.Mode = "auto"
	}

	now := time.Now()
	task := &db.Task{
		ID:          uuid.New().String(),
		Title:       req.Title,
		Description: req.Description,
		RepoPath:    req.RepoPath,
		Agent:       req.Agent,
		Mode:        req.Mode,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.db.CreateTask(task); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	s.hub.Broadcast("task:created", task)
	s.runTask(task)

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, task)
}

func (s *Server) deleteTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := s.db.DeleteTask(id); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	s.hub.Broadcast("task:deleted", map[string]string{"id": id})
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) retryTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	task, err := s.db.GetTask(id)
	if err != nil {
		http.Error(w, "task not found", 404)
		return
	}
	if err := s.db.UpdateTaskStatus(id, "pending", "", ""); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	task.Status = "pending"
	s.hub.Broadcast("task:updated", task)
	s.runTask(task)
	writeJSON(w, task)
}

func (s *Server) runTask(task *db.Task) {
	if err := s.db.SetTaskStarted(task.ID); err != nil {
		return
	}
	task.Status = "running"
	s.hub.Broadcast("task:updated", task)

	agent.Run(context.Background(), agent.RunConfig{
		TaskID:      task.ID,
		Title:       task.Title,
		Description: task.Description,
		RepoPath:    task.RepoPath,
		Agent:       task.Agent,
		Mode:        task.Mode,
		OnOutput: func(chunk string) {
			_ = s.db.AppendOutput(task.ID, chunk)
			s.hub.Broadcast("task:output", map[string]string{
				"id":    task.ID,
				"chunk": chunk,
			})
		},
		OnDone: func(err error) {
			status := "done"
			errMsg := ""
			if err != nil {
				status = "failed"
				errMsg = err.Error()
			}
			t, _ := s.db.GetTask(task.ID)
			_ = s.db.UpdateTaskStatus(task.ID, status, "", errMsg)
			if t != nil {
				t.Status = status
				t.Error = errMsg
				s.hub.Broadcast("task:updated", t)
			}
		},
	})
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
