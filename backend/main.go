package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/relay/backend/internal/api"
	"github.com/relay/backend/internal/db"
)

func main() {
	dataDir := os.Getenv("RELAY_DATA_DIR")
	if dataDir == "" {
		home, _ := os.UserHomeDir()
		dataDir = filepath.Join(home, ".relay")
	}

	database, err := db.Open(filepath.Join(dataDir, "relay.db"))
	if err != nil {
		log.Fatalf("open db: %v", err)
	}

	hub := api.NewHub()
	server := api.NewServer(database, hub)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("Hello!")
	fmt.Printf("Relay backend running on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, server.Routes()); err != nil {
		log.Fatal(err)
	}
}
