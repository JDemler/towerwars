package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"towerwars/internal/game"
)

type Server struct {
	runningGames map[string]*GameInstance
	openGames    map[string]*GameInstance
	agentsEnabld bool
	races        []*game.SocialNetworkConfig
}

type ServerStatus struct {
	OpenGames    int                   `json:"openGames"`
	RunningGames int                   `json:"runningGames"`
	GameStatus   map[string]GameStatus `json:"gameStatus"`
}

// new server
func NewServer(agentsEnabled bool) *Server {
	// Try to read config. Get config path from env variable
	var configPath string
	if os.Getenv("CONFIG_PATH") == "" {
		fmt.Println("No config path set. Using default config")
		configPath = "gameConfig.json"
	} else {
		fmt.Println("Using config from: ", os.Getenv("CONFIG_PATH"))
		configPath = os.Getenv("CONFIG_PATH")
	}
	config, err := game.ReadConfigFromFile(configPath)
	if err != nil {
		fmt.Println("Could not read config")
		fmt.Println(err)
		return nil
	}
	return &Server{
		runningGames: make(map[string]*GameInstance),
		openGames:    make(map[string]*GameInstance),
		agentsEnabld: agentsEnabled,
		races:        config.SocialNetworks,
	}
}

func (s *Server) gameOver(gameID string) {
	gameInstance := s.runningGames[gameID]
	if gameInstance == nil {
		return
	}
	// Remove game from running games
	delete(s.runningGames, gameID)
}

// Http Handler returning the game state
func (s *Server) GetGameState(w http.ResponseWriter, r *http.Request) {
	// Get game id from url
	gi, err := s.getGameInstanceFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	// Return game state
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(gi.game)
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

type JoinGame struct {
	Name string `json:"name"`
	Race string `json:"race"`
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

func getFieldIDFromRequest(r *http.Request) (int, error) {
	playerID := r.URL.Query().Get("fieldId")
	if playerID == "" {
		return 0, fmt.Errorf("playerId not found")
	}
	// id to int
	id, err := strconv.Atoi(playerID)
	return id, err
}

func (s *Server) AddPlayer(w http.ResponseWriter, r *http.Request) {
	// Check if there is an open game
	if len(s.openGames) == 0 {
		// create a game id
		gameID := randomString(16)
		// Add new game to open games
		s.openGames[gameID] = NewGameInstance(gameID)
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
	// Read join game object from body
	var joinPlayer JoinGame
	err := json.NewDecoder(r.Body).Decode(&joinPlayer)
	if err != nil {
		fmt.Println(err)
		// Keep playername optional for now
		// w.WriteHeader(http.StatusBadRequest)
		// return
		joinPlayer = JoinGame{Name: "hans", Race: "facebook"}
	}

	// add player to game and get its playerKey
	playerKey := gameInstance.AddPlayer(joinPlayer.Name, joinPlayer.Race)
	fieldID := len(gameInstance.game.Fields) - 1
	//log player joined
	fmt.Println("Player joined")

	if s.agentsEnabld {
		gameInstance.AddAgent()
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
	fieldID, err := getFieldIDFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(gi.game.GetTowerTypes(fieldID))
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
	fieldID, err := getFieldIDFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(gi.game.GetMobTypes(fieldID))
	if err != nil {
		fmt.Println(err)
	}
}

func (s *Server) GetSocialMediaNetworks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(s.races)
	if err != nil {
		fmt.Println(err)
	}
}

func (s *Server) StartGame(w http.ResponseWriter, r *http.Request) {
	gi, err := s.getGameInstanceFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	// Check if game is full and start if so
	if gi.game.CanStart() {
		// Remove game from open games
		delete(s.openGames, gi.id)
		// Add game to running games
		s.runningGames[gi.id] = gi
		// Start game
		fmt.Println("Game ", gi.id, " started")
		go gi.Start(s)
	} else {
		w.WriteHeader(http.StatusBadRequest)
	}
	w.WriteHeader(http.StatusOK)
}

func (s *Server) GetStatus(w http.ResponseWriter, r *http.Request) {
	gameStatus := ServerStatus{
		OpenGames:    len(s.openGames),
		RunningGames: len(s.runningGames),
		GameStatus:   make(map[string]GameStatus),
	}

	for gameID, gameInstance := range s.openGames {
		gameStatus.GameStatus[gameID] = gameInstance.getStatus()
	}
	for gameID, gameInstance := range s.runningGames {
		gameStatus.GameStatus[gameID] = gameInstance.getStatus()
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(gameStatus)
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
	agent := false
	flag.Parse()
	fmt.Println(flag.Args())
	// iterate cmd line args
	for _, arg := range flag.Args() {
		// check if arg is agent
		if arg == "agent" {
			agent = true
		}
	}

	s := NewServer(agent)

	http.HandleFunc("/status", s.GetStatus)
	http.HandleFunc("/game", s.GetGameState)
	http.HandleFunc("/add_player", s.AddPlayer)
	http.HandleFunc("/tower_types", s.GetTowerTypes)
	http.HandleFunc("/mob_types", s.GetMobTypes)
	http.HandleFunc("/start_game", s.StartGame)
	http.HandleFunc("/social_media_networks", s.GetSocialMediaNetworks)
	http.HandleFunc("/ws", s.WebSocket)
	err := http.ListenAndServe(":8080", logAndAddCorsHeadersToRequest(http.DefaultServeMux))
	if err != nil {
		panic(err)
	}
}
