// Package game implements the SocialMediaWars Game
package game

import (
	"fmt"
	"math"
	"time"
)

// WaitingState is the state of the game when players are waiting for the game to start
const WaitingState = "WaitingForPlayers"

// PlayingState is the state of the game when the game is running
const PlayingState = "Playing"

// GameOverState is the state of the game when the game is over
const GameOverState = "GameOver"

// Game contains all information about one game instance
type Game struct {
	Fields         []*Field       `json:"fields"`
	Elapsed        float64        `json:"elapsed"`
	IncomeCooldown float64        `json:"incomeCooldown"`
	State          string         `json:"state"`
	Config         *Config        `json:"-"`
	events         []*ServerEvent `json:"-"`
}

// NewGame creates a new game instance from a config
func NewGame(config *Config) *Game {
	return &Game{
		Fields:         []*Field{},
		Elapsed:        0,
		IncomeCooldown: float64(config.IncomeCooldown),
		State:          WaitingState,
		Config:         config,
	}
}

// GetMobsSent
func (game *Game) GetMobsSent() int {
	mobsSent := 0
	for _, field := range game.Fields {
		mobsSent += field.mobCounter
	}
	return mobsSent
}

// GetTowersBuilt
func (game *Game) GetTowersBuilt() int {
	towersBuilt := 0
	for _, field := range game.Fields {
		towersBuilt += field.towerCounter
	}
	return towersBuilt
}

func (game *Game) GetDuration() float64 {
	return game.Elapsed
}

// AddPlayer to Game. Return its key
func (game *Game) AddPlayer(playerName string, race string) (string, *ServerEvent) {
	id := len(game.Fields)
	player := &Player{
		ID:     id,
		Name:   playerName,
		Money:  game.Config.StartStats.Money,
		Income: game.Config.StartStats.Income,
		Lives:  game.Config.StartStats.Lives,
	}
	barracks := newBarracks(id, race, game.Config)
	field := NewField(id, race, player, barracks, game.Config.Map.GenerateMap())
	game.Fields = append(game.Fields, field)
	return field.Key, createEvent(field, id)
}

// PlayerIDFromKey returns the player id from a key
func (game *Game) PlayerIDFromKey(key string) int {
	for _, field := range game.Fields {
		if field.Key == key {
			return field.Player.ID
		}
	}
	return -1
}

// CanStart
func (game *Game) CanStart() bool {
	return len(game.Fields) >= 2
}

// Start game if there are more than two players
func (game *Game) Start() {
	if len(game.Fields) < 2 {
		return
	}
	game.State = PlayingState
	game.events = append(game.events, &ServerEvent{
		Type: "gameStateChanged",
		Payload: StateChangedEvent{
			GameState: game.State,
		},
	})
}

// Returns field with Id or nil if not found
func (game *Game) getFieldAt(id int) *Field {
	for _, field := range game.Fields {
		if field.ID == id {
			return field
		}
	}
	return nil
}

func (game *Game) HandleEvents(fieldEvents []FieldEvent) ([]*ServerEvent, error) {
	events := []*ServerEvent{}
	for _, fieldEvent := range fieldEvents {
		event, err := game.HandleEvent(fieldEvent)
		if err != nil {
			return nil, err
		}
		events = append(events, event...)
	}
	return events, nil
}

// HandleEvent handles an event from a player, returns a list of events to send to all players or nil if the event was invalid
func (game *Game) HandleEvent(fieldEvent FieldEvent) ([]*ServerEvent, error) {
	targetField := game.getFieldAt(fieldEvent.FieldID)
	if targetField != nil {
		// Check that event.key and field.key match
		if fieldEvent.Key != targetField.Key {
			// Currently only log a message. In the future return an error to the client
			fmt.Printf("Invalid key for field %d. Expected %s, got %s\n", fieldEvent.FieldID, targetField.Key, fieldEvent.Key)
			//return nil, fmt.Errorf("Invalid key! Player unauthorized")
		}
		return targetField.HandleEvent(fieldEvent.Payload, game.Fields, game.Config)
	}
	return []*ServerEvent{}, fmt.Errorf("Field not found")
}

// Set Player Ping
func (game *Game) Ping(fieldID int, latency int64) {
	field := game.getFieldAt(fieldID)
	if field != nil {
		field.Player.Latency = latency
		field.Player.LastPing = time.Now().UnixMicro()
		// Update Player Event
		game.events = append(game.events, updateEvent(field.Player, fieldID))
	}
}

// Update loop for the game
func (game *Game) Update(delta float64) []*ServerEvent {
	events := game.events
	game.events = []*ServerEvent{}
	// Only do something when the game is playing
	if game.State != PlayingState {
		return events
	}
	// reduce income cooldown
	game.IncomeCooldown = math.Max(game.IncomeCooldown-delta, 0)
	// when income cooldown is 0 payout
	if game.IncomeCooldown == 0 {
		for _, field := range game.Fields {
			field.Payout()
			// addPlayerUpdateEvent
			events = append(events, updateEvent(field.Player, field.ID))
		}
		game.IncomeCooldown = float64(game.Config.IncomeCooldown)
		// notify clients about new income cooldown
		events = append(events, &ServerEvent{
			Type:    "incomeCooldown",
			Kind:    "update",
			FieldID: -1,
			Payload: game.IncomeCooldown,
		})
	}

	game.Elapsed += delta
	for i := len(game.Fields) - 1; i >= 0; i-- {
		// Check if player is still alive
		if game.Fields[i].Player.Lives <= 0 {
			// for all mobs and bullets on that field send destroy events
			for _, mob := range game.Fields[i].Mobs {
				events = append(events, deleteEvent(mob, game.Fields[i].ID))
			}
			for _, bullet := range game.Fields[i].Bullets {
				events = append(events, deleteEvent(bullet, game.Fields[i].ID))
			}
			game.Fields = append(game.Fields[:i], game.Fields[i+1:]...)
			continue
		}

		fieldEvents := game.Fields[i].Update(delta)
		// Check all fieldEvents for liveStolen and execute them and take them out of the events
		for j := len(fieldEvents) - 1; j >= 0; j-- {
			if fieldEvents[j].Type == "liveStolen" {
				liveStolenEvent := fieldEvents[j].Payload.(liveStolenEvent)
				// Get the field where the live was stolen from
				originField := game.getFieldAt(liveStolenEvent.FieldID)
				// Get the field where the live was stolen to
				targetField := game.getFieldAt(liveStolenEvent.mob.SentFromFieldID)

				// Check if both fields exist
				if originField != nil && targetField != nil {
					// Mob now starts in next field
					nextField := findNextField(originField.ID, game.Fields)
					if nextField.ID == targetField.ID {
						nextField = findNextField(targetField.ID, game.Fields)
					}
					// Get startposition
					startX, startY := nextField.TWMap.startPosition()
					mobID := nextField.getNextMobID()
					mob := liveStolenEvent.mob
					mob.ID = mobID
					mob.X = float64(startX) + 0.5
					mob.Y = float64(startY) + 0.5
					mob.TargetX = mob.X
					mob.TargetY = mob.Y
					mob.Reached = false
					nextField.Mobs = append(nextField.Mobs, &mob)
					events = append(events, createEvent(&mob, nextField.ID))
					// Check if the player has enough lives to steal
					if originField.Player.Lives >= 1 {
						// Steal lives
						originField.Player.Lives--
						targetField.Player.Lives++
						// Add events to the event list
						events = append(events, updateEvent(originField.Player, originField.ID))
						events = append(events, updateEvent(targetField.Player, targetField.ID))
					}
				}
				// Remove the event from the list
				fieldEvents = append(fieldEvents[:j], fieldEvents[j+1:]...)
			}
		}
		events = append(events, fieldEvents...)
	}
	// Set game over if there is only one player left
	if len(game.Fields) <= 1 {
		game.State = GameOverState
		events = append(events, &ServerEvent{
			Type: "gameStateChanged",
			Payload: StateChangedEvent{
				GameState: game.State,
			},
		})
		// for all mobs and bullets on that field send destroy events
		for _, mob := range game.Fields[0].Mobs {
			events = append(events, deleteEvent(mob, game.Fields[0].ID))
		}
		for _, bullet := range game.Fields[0].Bullets {
			events = append(events, deleteEvent(bullet, game.Fields[0].ID))
		}
	}
	return events
}

// GetTowerTypes returns all tower types for that game instance
func (game *Game) GetTowerTypes(fieldID int) []*TowerType {
	field := game.getFieldAt(fieldID)
	if field != nil {
		return game.Config.getRaceConfigByKey(field.SocialNetwork).TowerTypes
	}
	return nil
}

// GetMobTypes returns all mob types for that game instance
func (game *Game) GetMobTypes(fieldID int) []*MobType {
	field := game.getFieldAt(fieldID)
	if field != nil {
		return game.Config.getRaceConfigByKey(field.SocialNetwork).MobTypes
	}
	return nil
}

func (game *Game) GetSocialMediaNetworks() []*SocialNetworkConfig {
	return game.Config.SocialNetworks
}
