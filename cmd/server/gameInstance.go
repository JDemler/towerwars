package main

import (
	"fmt"
	"net/http"
	"os"

	"strconv"
	"sync"
	"time"
	"towerwars/internal/agent"
	"towerwars/internal/game"

	"github.com/gorilla/websocket"
)

type GameInstance struct {
	game          *game.Game
	id            string
	writeChannels []*WsChannel
	channelCount  int
	agents        []*agent.Agent
}

type GameStatus struct {
	Players     int `json:"players"`
	Duration    int `json:"duration"`
	MobsSent    int `json:"mobsSent"`
	TowersBuilt int `json:"towersBuilt"`
}

type WsChannel struct {
	id            int
	ping          int64
	open          bool
	playerID      int
	authenticated bool
	Channel       chan game.ServerEvent
	Websocket     *websocket.Conn
	mu            sync.Mutex
	game          *game.Game
}

func (ws *WsChannel) Close() {
	ws.open = false
	ws.Websocket.Close()
}

func NewGameInstance(id string) *GameInstance {
	//Try to read config. Get config path from env variable
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
	// read all yamls in networkconfigs folder as SocialNetworkConfig and add to config

	//iterate files in networkconfigs folder
	files, err := os.ReadDir("networkconfigs")
	if err != nil {
		fmt.Println(err)
		return nil
	}
	for _, f := range files {
		//read file
		networkConfig, err := game.ReadSocialNetworkConfigFromFile("networkconfigs/" + f.Name())
		if err != nil {
			fmt.Println(err)
			return nil
		}
		//add to config
		config.SocialNetworks = append(config.SocialNetworks, networkConfig)
	}
	// apply metaconfig
	config = metaConfig().Apply(config)

	return &GameInstance{
		game: game.NewGame(config),
		id:   id,
	}
}

// Constant metaconfig
func metaConfig() *game.MetaConfig {
	return &game.MetaConfig{
		TowerDmgFactor:   1,
		TowerCostFactor:  1,
		TowerRangeFactor: 1,
		MobHpFactor:      1,
		MobSpeedFactor:   1,
		MobIncomeFactor:  1,
		MobCostFactor:    1,
		BarracksFactor:   1,
	}
}

func (gi *GameInstance) AddAgent() {
	_, event := gi.game.AddPlayer("agent", "facebook")
	for _, c := range gi.writeChannels {
		if c.open {
			c.Channel <- *event
		}
	}
	fieldID := len(gi.game.Fields) - 1
	agent := agent.NewAgent(gi.game, fieldID, agent.NaiveAgentConfig(), "facebook")
	gi.agents = append(gi.agents, agent)
}

func (gi *GameInstance) AddPlayer(playerName string, socialNetwork string) string {
	key, event := gi.game.AddPlayer(playerName, socialNetwork)
	//Send event to all other clients
	for _, c := range gi.writeChannels {
		if c.open {
			c.Channel <- *event
		}
	}
	return key
}

// Update the game
func (gi *GameInstance) Update(delta float64) []*game.ServerEvent {
	return gi.game.Update(delta)
}

func (gi *GameInstance) getStatus() GameStatus {
	return GameStatus{
		Players:     len(gi.game.Fields),
		Duration:    int(gi.game.GetDuration()),
		MobsSent:    gi.game.GetMobsSent(),
		TowersBuilt: gi.game.GetTowersBuilt(),
	}
}

func (gi *GameInstance) readFromWS(ws *WsChannel) {
	defer func() {
		fmt.Println("Stopped readToWS loop!")
		for i, ch := range gi.writeChannels {
			if ch.id == ws.id {
				fmt.Println("Removing channel from writeChannels")
				fmt.Println("writeChannels len before: ", len(gi.writeChannels))
				gi.writeChannels = append(gi.writeChannels[:i], gi.writeChannels[i+1:]...)
				fmt.Println("writeChannels len: ", len(gi.writeChannels))
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
			fmt.Println("Could not read from websocket")
			fmt.Println(err)
			return
		}
		// debug message
		fmt.Println("Received event through ws")
		fmt.Println(event)
		// HandleEvent
		events, error := gi.game.HandleEvent(event)
		if error != nil {
			fmt.Println("Could not handle event")
			fmt.Println(error)
			continue
		}

		// send events to all clients
		for _, event := range events {
			for _, c := range gi.writeChannels {
				if c.open {
					c.Channel <- *event
				}
			}
		}
		// loop over all agents and update them
		if len(events) > 0 {
			for _, agent := range gi.agents {
				agent.HandleEvents(events)
			}
		}
	}
}

func (gi *GameInstance) writeToWS(ws *WsChannel) {
	defer func() {
		fmt.Println("Stopped writeToWS loop!")
		for i, ch := range gi.writeChannels {
			if ch.id == ws.id {
				fmt.Println("Removing channel from writeChannels")
				fmt.Println("writeChannels len before: ", len(gi.writeChannels))
				gi.writeChannels = append(gi.writeChannels[:i], gi.writeChannels[i+1:]...)
				fmt.Println("writeChannels len: ", len(gi.writeChannels))
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
		err := ws.sendJSON(event)
		if err != nil {
			fmt.Println("Error in writeToWS loop!")
			fmt.Println(err)
			return
		}
	}
}

func (ws *WsChannel) sendJSON(event game.ServerEvent) error {
	ws.mu.Lock()
	defer ws.mu.Unlock()
	return ws.Websocket.WriteJSON(event)
}

func (ws *WsChannel) pingLoop() {
	defer func() {
		fmt.Println("Stopped pingLoop!")
		ws.Close()
	}()
	fmt.Println("Started pingLoop!")
	for {
		if !ws.open {
			return
		}
		err := ws.sendPing()
		if err != nil {
			fmt.Println("Error in pingLoop!")
			fmt.Println(err)
			return
		}
		time.Sleep(5 * time.Second)
	}
}

func (ws *WsChannel) sendPing() error {
	//Current timestamp
	t := time.Now()
	ws.mu.Lock()
	defer ws.mu.Unlock()
	// send ping with current server timestamp
	return ws.Websocket.WriteMessage(websocket.PingMessage, []byte(strconv.FormatInt(t.UnixMicro(), 10)))
}

func (ws *WsChannel) handlePong(message string) error {
	//Current timestamp
	t := time.Now()
	// convert message to int64
	timestamp, err := strconv.ParseInt(message, 10, 64)
	if err != nil {
		fmt.Println("Error parsing pong message")
		fmt.Println(err)
		return err
	}
	// calculate latency
	latency := t.UnixMicro() - timestamp
	ws.ping = latency
	ws.game.Ping(ws.playerID, latency)
	return nil
}

// Serve Websocket
func (gi *GameInstance) WebSocket(w http.ResponseWriter, r *http.Request) {
	// Get Player Key
	playerKey := r.URL.Query().Get("playerKey")
	// Log Player Key
	fmt.Println("Player Key: ", playerKey)
	playerID := gi.game.PlayerIDFromKey(playerKey)

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
	gameEventChan := make(chan game.ServerEvent)
	wsChannel := &WsChannel{
		id:            gi.channelCount,
		open:          true,
		Channel:       gameEventChan,
		playerID:      playerID,
		authenticated: playerID >= 0,
		Websocket:     conn,
	}
	gi.channelCount++
	wsChannel.Websocket.SetPongHandler(wsChannel.handlePong)
	wsChannel.game = gi.game
	// register channels
	gi.writeChannels = append(gi.writeChannels, wsChannel)
	// start reading from websocket
	go gi.readFromWS(wsChannel)
	// start writing to websocket
	go gi.writeToWS(wsChannel)
	// start ping loop
	go wsChannel.pingLoop()
}

func (gi *GameInstance) Start(s *Server) {
	// sleep 1 seconds for all clients to connect
	time.Sleep(1 * time.Second)
	gi.game.Start()
	// Gameloop returns when game is over
	gi.gameLoop()
	s.gameOver(gi.id)
}

// gameLoop
func (gi *GameInstance) gameLoop() {
	last := time.Now()
	for {
		delta := float64(time.Since(last).Milliseconds()) / 1000.0
		last = time.Now()
		events := gi.Update(delta)
		if len(events) > 0 {
			for _, agent := range gi.agents {
				outEvents := agent.Act(events)
				for _, event := range outEvents {
					serverEvents, err := gi.game.HandleEvent(event)
					if err != nil {
						fmt.Println("Error handling event from agent!")
						fmt.Println(err)
					} else {
						events = append(events, serverEvents...)
						agent.HandleEvents(serverEvents)
					}
				}
			}
		}
		for _, event := range events {
			for _, c := range gi.writeChannels {
				if c.open {
					c.Channel <- *event
				}
			}
		}

		time.Sleep(time.Second / 60)
		if gi.game.State == game.GameOverState {
			return
		}
	}
}
