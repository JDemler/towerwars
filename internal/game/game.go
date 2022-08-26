// Package game implements the SocialMediaWars Game
package game

import (
	"fmt"
	"math"
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

// AddPlayer to Game. Return its key
func (game *Game) AddPlayer(playerName string) string {
	id := len(game.Fields)
	player := &Player{
		ID:     id,
		Name:   playerName,
		Money:  game.Config.StartStats.Money,
		Income: game.Config.StartStats.Income,
		Lives:  game.Config.StartStats.Lives,
	}
	barracks := newBarracks(game.Config.MobTypes)
	field := NewField(id, player, barracks, game.Config.Map.GenerateMap())
	game.Fields = append(game.Fields, field)
	game.events = append(game.events, createEvent(player, id))
	return field.Key
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
				// Get the field where the live was stolen from
				originField := game.getFieldAt(fieldEvents[j].Payload.(liveStolenEvent).FieldID)
				// Get the field where the live was stolen to
				targetField := game.getFieldAt(fieldEvents[j].Payload.(liveStolenEvent).SentFromFieldID)
				// Check if both fields exist
				if originField != nil && targetField != nil {
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
func (game *Game) GetTowerTypes() []*TowerType {
	return game.Config.TowerTypes
}

// GetMobTypes returns all mob types for that game instance
func (game *Game) GetMobTypes() []*MobType {
	return game.Config.MobTypes
}