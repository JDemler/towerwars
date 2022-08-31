package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"towerwars/internal/game"
)

type Server struct {
	runningGames map[string]*GameInstance
	openGames    map[string]*GameInstance
}

// new server
func NewServer() *Server {
	return &Server{
		runningGames: make(map[string]*GameInstance),
		openGames:    make(map[string]*GameInstance),
	}
}

// Http Handler returning the game state
func (s *Server) GetGameState(w http.ResponseWriter, r *http.Request) {
	// Get game id from url
	gameId := r.URL.Query().Get("gameId")
	// Get game instance
	gameInstance := s.runningGames[gameId]
	if gameInstance == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	// Return game state
	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(gameInstance.game)
	if err != nil {
		fmt.Println(err)
	}
}

// added player struct
type AddedPlayer struct {
	Key     string `json:"key"`
	FieldID int    `json:"fieldId"`
	GameID  string `json:"gameId"`
}

func randomString(length int) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, length)
	rand.Read(b)
	return fmt.Sprintf("%x", b)[:length]
}

func (s *Server) getGameInstanceFromRequest(r *http.Request) (*GameInstance, error) {
	// Get game id from url
	gameID := r.URL.Query().Get("gameId")
	// Get game instance
	gameInstance := s.runningGames[gameID]
	if gameInstance == nil {
		gameInstance = s.openGames[gameID]
		if gameInstance == nil {
			return nil, fmt.Errorf("game not found")
		}
	}
	return gameInstance, nil
}

func (s *Server) AddPlayer(w http.ResponseWriter, r *http.Request) {
	// Check if there is an open game
	if len(s.openGames) == 0 {
		// create a game id
		gameID := randomString(16)
		// Add new game to open games
		s.openGames[gameID] = NewGameInstance()
	}
	// Get first open game
	var gameInstance *GameInstance
	var gameID string
	for gID, game := range s.openGames {
		gameInstance = game
		gameID = gID
		break
	}

	// Check if game is still in waiting state
	if gameInstance.game.State != game.WaitingState {
		// return bad request
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	// Read player name from body
	var playerName string
	err := json.NewDecoder(r.Body).Decode(&playerName)
	if err != nil {
		fmt.Println(err)
		// Keep playername optional for now
		// w.WriteHeader(http.StatusBadRequest)
		// return
		playerName = "hans"
	}
	// add player to game and get its playerKey
	playerKey := gameInstance.game.AddPlayer(playerName)
	fieldID := len(gameInstance.game.Fields) - 1
	//log player joined
	fmt.Println("Player joined")
	// Check if game is full and start if so
	if gameInstance.game.CanStart() {
		// Remove game from open games
		delete(s.openGames, gameID)
		// Add game to running games
		s.runningGames[gameID] = gameInstance
		// Start game
		fmt.Println("Game ", gameID, " started")
		go gameInstance.Start()
	}
	// return success
	w.WriteHeader(http.StatusOK)
	// return player id
	err = json.NewEncoder(w).Encode(AddedPlayer{Key: playerKey, FieldID: fieldID, GameID: gameID})
	if err != nil {
		fmt.Println(err)
	}
}

func (s *Server) WebSocket(w http.ResponseWriter, r *http.Request) {
	gi, err := s.getGameInstanceFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	gi.WebSocket(w, r)
}

func (s *Server) GetTowerTypes(w http.ResponseWriter, r *http.Request) {
	gi, err := s.getGameInstanceFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(gi.game.GetTowerTypes())
	if err != nil {
		fmt.Println(err)
	}
}

func (s *Server) GetMobTypes(w http.ResponseWriter, r *http.Request) {
	gi, err := s.getGameInstanceFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(gi.game.GetMobTypes())
	if err != nil {
		fmt.Println(err)
	}
}

func (s *Server) GetStatus(w http.ResponseWriter, r *http.Request) {
	gi, err := s.getGameInstanceFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(gi.game.State)
	if err != nil {
		fmt.Println(err)
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
		if r.Method == http.MethodOptions {
			return
		}
		handler.ServeHTTP(w, r)
	})
}

func main() {
	s := NewServer()

	http.HandleFunc("/status", s.GetStatus)
	http.HandleFunc("/game", s.GetGameState)
	http.HandleFunc("/add_player", s.AddPlayer)
	http.HandleFunc("/tower_types", s.GetTowerTypes)
	http.HandleFunc("/mob_types", s.GetMobTypes)
	http.HandleFunc("/ws", s.WebSocket)
	err := http.ListenAndServe(":8080", logAndAddCorsHeadersToRequest(http.DefaultServeMux))
	if err != nil {
		panic(err)
	}
}
