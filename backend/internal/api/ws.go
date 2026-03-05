package api

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Hub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]struct{}
}

func NewHub() *Hub {
	return &Hub{clients: make(map[*websocket.Conn]struct{})}
}

func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	h.mu.Lock()
	h.clients[conn] = struct{}{}
	h.mu.Unlock()

	defer func() {
		h.mu.Lock()
		delete(h.clients, conn)
		h.mu.Unlock()
		conn.Close()
	}()

	// keep alive — read until disconnect
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

func (h *Hub) Broadcast(event string, payload any) {
	msg, _ := json.Marshal(map[string]any{
		"event":   event,
		"payload": payload,
	})
	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.clients {
		_ = conn.WriteMessage(websocket.TextMessage, msg)
	}
}
