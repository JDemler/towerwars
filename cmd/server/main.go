// HTTP Server for the towerwars game
package main

import (
	"encoding/json"
	"net/http"
	"time"

	"towerwars/pkg/game"
)

type Server struct {
	game *game.Game
}

func NewServer() *Server {
	return &Server{
		game: game.NewGame(),
	}
}

// Update the game
func (s *Server) Update(delta float64, events []game.FieldEvent) {
	s.game.Update(delta, events)
}

// Http Handler returning the game state
func (s *Server) GetGameState(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s.game)
}

// gameLoop
func (s *Server) gameLoop() {
	last := time.Now()
	for {
		delta := float64(time.Now().Sub(last).Milliseconds()) / 1000.0
		last = time.Now()
		s.Update(delta, nil)
		time.Sleep(time.Second / 60)
	}
}

func main() {
	s := NewServer()
	go s.gameLoop()

	http.HandleFunc("/game", s.GetGameState)
	http.ListenAndServe(":8080", nil)
}
