// HTTP Server for the towerwars game
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"towerwars/pkg/game"

	"github.com/gorilla/websocket"
)

type Server struct {
	game          *game.Game
	writeChannels []*WsChannel
	channelCount  int
}

type WsChannel struct {
	id        int
	open      bool
	Channel   chan game.GameEvent
	Websocket *websocket.Conn
}

func (ws *WsChannel) Close() {
	ws.open = false
	ws.Websocket.Close()
}

func NewServer() *Server {
	return &Server{
		game: game.NewGame(),
	}
}

// Update the game
func (s *Server) Update(delta float64) []*game.GameEvent {
	return s.game.Update(delta)
}

// Http Handler returning the game state
func (s *Server) GetGameState(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(s.game)
}

// added player struct
type AddedPlayer struct {
	Key     string `json:"key"`
	FieldId int    `json:"fieldId"`
}

func (s *Server) AddPlayer(w http.ResponseWriter, r *http.Request) {
	// Check if game is still in waiting state
	if s.game.State != game.WaitingState {
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
	// add player to game and get its key
	key := s.game.AddPlayer(playerName)
	fieldId := len(s.game.Fields) - 1
	// return success
	w.WriteHeader(http.StatusOK)
	// return player id
	json.NewEncoder(w).Encode(AddedPlayer{Key: key, FieldId: fieldId})

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
	events, error := s.game.HandleEvent(event)
	if error != nil {
		fmt.Println("Could not handle event")
		fmt.Println(error)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// send events to all clients
	for _, event := range events {
		for _, c := range s.writeChannels {
			if c.open {
				c.Channel <- *event
			}
		}
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

func (s *Server) GetStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s.game.State)
}

func (s *Server) readFromWS(ws *WsChannel) {
	defer func() {
		fmt.Println("Stopped readToWS loop!")
		for i, ch := range s.writeChannels {
			if ch.id == ws.id {
				fmt.Println("Removing channel from writeChannels")
				fmt.Println("writeChannels len before: ", len(s.writeChannels))
				s.writeChannels = append(s.writeChannels[:i], s.writeChannels[i+1:]...)
				fmt.Println("writeChannels len: ", len(s.writeChannels))
			}
		}
		ws.Close()
	}()
	for {
		if !ws.open {
			return
		}
		var event game.FieldEvent
		err := ws.Websocket.ReadJSON(&event)
		if err != nil {
			fmt.Println(err)
			fmt.Println("Closing readFromWS loop!")
			return
		}

		// debug message
		fmt.Println("Received event through ws")
		fmt.Println(event)
		// HandleEvent
		events, error := s.game.HandleEvent(event)
		if error != nil {
			fmt.Println("Could not handle event")
			fmt.Println(error)
		}

		// send events to all clients
		for _, event := range events {
			for _, c := range s.writeChannels {
				if c.open {
					c.Channel <- *event
				}
			}
		}
	}
}

func (s *Server) writeToWS(ws *WsChannel) {
	defer func() {
		fmt.Println("Stopped writeToWS loop!")
		for i, ch := range s.writeChannels {
			if ch.id == ws.id {
				fmt.Println("Removing channel from writeChannels")
				fmt.Println("writeChannels len before: ", len(s.writeChannels))
				s.writeChannels = append(s.writeChannels[:i], s.writeChannels[i+1:]...)
				fmt.Println("writeChannels len: ", len(s.writeChannels))
			}
		}
		ws.Close()
	}()
	for {
		if !ws.open {
			return
		}
		event := <-ws.Channel
		if ws == nil {
			fmt.Println("Websocket was nil!")
			return
		}
		err := ws.Websocket.WriteJSON(event)
		if err != nil {
			fmt.Println("Error in writeToWS loop!")
			fmt.Println(err)
			return
		}
	}
}

// Serve Websocket
func (s *Server) WebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	// create channels
	gameEventChan := make(chan game.GameEvent)
	wsChannel := &WsChannel{
		id:        s.channelCount,
		open:      true,
		Channel:   gameEventChan,
		Websocket: conn,
	}
	s.channelCount++
	// register channels
	s.writeChannels = append(s.writeChannels, wsChannel)
	// start reading from websocket
	go s.readFromWS(wsChannel)
	// start writing to websocket
	go s.writeToWS(wsChannel)
}

// Reset
func (s *Server) reset() {
	// Wait for five seconds
	time.Sleep(5 * time.Second)
	s.game = game.NewGame()
	// Close all channels
	for _, c := range s.writeChannels {
		c.Close()
	}

	// Start new game
	s.gameLoop()
}

// gameLoop
func (s *Server) gameLoop() {
	last := time.Now()
	for {
		delta := float64(time.Now().Sub(last).Milliseconds()) / 1000.0
		last = time.Now()
		if s.game.State == game.WaitingState && len(s.game.Fields) > 1 {
			s.game.Start()
			// log that game started
			fmt.Println("Game started")
		}
		events := s.Update(delta)
		for _, event := range events {
			for _, c := range s.writeChannels {
				if c.open {
					c.Channel <- *event
				}
			}
		}
		time.Sleep(time.Second / 60)
		if s.game.State == game.GameOverState {
			go s.reset()
			return
		}
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
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode("Ok")
			return
		} else {
			handler.ServeHTTP(w, r)
		}
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
	http.HandleFunc("/status", s.GetStatus)
	http.HandleFunc("/game", s.GetGameState)
	http.HandleFunc("/add_player", s.AddPlayer)
	http.HandleFunc("/register_event", s.RegisterEvent)
	http.HandleFunc("/tower_types", s.GetTowerTypes)
	http.HandleFunc("/mob_types", s.GetMobTypes)
	http.HandleFunc("/ws", s.WebSocket)
	http.ListenAndServe(":8080", logAndAddCorsHeadersToRequest(http.DefaultServeMux))
}
