// HTTP Server for the towerwars game
package main

import (
	"encoding/json"
	"fmt"
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
func (s *Server) Update(delta float64) {
	s.game.Update(delta)
}

// Http Handler returning the game state
func (s *Server) GetGameState(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(s.game)
}

func (s *Server) AddPlayer(w http.ResponseWriter, r *http.Request) {
	// Check if game is still in waiting state
	if s.game.State != game.WaitingState {
		// return bad request
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// add player to game
	player := game.NewPlayer()
	s.game.AddPlayer(player)

	// return success
	w.WriteHeader(http.StatusOK)
	// return player id
	json.NewEncoder(w).Encode(len(s.game.Fields) - 1)

	//log player joined
	fmt.Println("Player joined")
}

func (s *Server) RegisterEvent(w http.ResponseWriter, r *http.Request) {
	// decode event
	var event game.FieldEvent
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// HandleEvent
	if !s.game.HandleEvent(event) {
		fmt.Println("Could not handle event")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// return success
	w.WriteHeader(http.StatusOK)
}

func (s *Server) GetTowerTypes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s.game.TowerTypes())
}

func (s *Server) GetMobTypes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s.game.MobTypes())
}

// gameLoop
func (s *Server) gameLoop() {
	last := time.Now()
	for {
		delta := float64(time.Now().Sub(last).Milliseconds()) / 1000.0
		last = time.Now()
		if len(s.game.Fields) > 1 {
			s.game.Start()
		}
		s.Update(delta)
		time.Sleep(time.Second / 60)
	}
}

func logAndAddCorsHeadersToRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// log request
		fmt.Println(r.Method, r.URL.Path)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		// Handle OPTIONS requests
		if r.Method == "OPTIONS" {
			return
		}
		handler.ServeHTTP(w, r)
	})
}

func main() {
	s := NewServer()
	go s.gameLoop()
	// Accept CORS
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// log request
		fmt.Println(r.Method, r.URL.Path)

		http.DefaultServeMux.ServeHTTP(w, r)
	})
	http.HandleFunc("/game", s.GetGameState)
	http.HandleFunc("/add_player", s.AddPlayer)
	http.HandleFunc("/register_event", s.RegisterEvent)
	http.HandleFunc("/tower_types", s.GetTowerTypes)
	http.HandleFunc("/mob_types", s.GetMobTypes)
	http.ListenAndServe(":8080", logAndAddCorsHeadersToRequest(http.DefaultServeMux))
}
