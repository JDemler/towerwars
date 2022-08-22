package game

import (
	"fmt"
	"math"
)

const TileSize = 32
const WaitingState = "WaitingForPlayers"
const PlayingState = "Playing"
const GameOverState = "GameOver"

type Player struct {
	Id     int    `json:"id"`
	Name   string `json:"name"`
	Money  int    `json:"money"`
	Income int    `json:"income"`
	Lives  int    `json:"lives"`
}

type Game struct {
	Fields         []*Field     `json:"fields"`
	Elapsed        float64      `json:"elapsed"`
	IncomeCooldown float64      `json:"incomeCooldown"`
	State          string       `json:"state"`
	Config         *GameConfig  `json:"-"`
	events         []*GameEvent `json:"-"`
}

func NewGame(config *GameConfig) *Game {
	return &Game{
		Fields:         []*Field{},
		Elapsed:        0,
		IncomeCooldown: float64(config.IncomeCooldown),
		State:          WaitingState,
		Config:         config,
	}
}

// Add Player to Game. Return its key
func (game *Game) AddPlayer(playerName string) string {
	player := &Player{
		Id:     len(game.Fields),
		Name:   playerName,
		Money:  game.Config.StartStats.Money,
		Income: game.Config.StartStats.Income,
		Lives:  game.Config.StartStats.Lives,
	}
	field := NewField(len(game.Fields), player, game.Config.Map.GenerateMap())
	game.Fields = append(game.Fields, field)
	game.events = append(game.events, &GameEvent{
		Type: "playerJoined",
		Payload: PlayerJoinedEvent{
			Player: player,
		},
	})
	return field.Key
}

// Start game if there are more than two players
func (game *Game) Start() {
	if len(game.Fields) < 2 {
		return
	}
	game.State = PlayingState
	game.events = append(game.events, &GameEvent{
		Type: "gameStateChanged",
		Payload: GameStateChangedEvent{
			GameState: game.State,
		},
	})
}

// Returns field with Id or nil if not found
func (game *Game) getFieldAt(id int) *Field {
	for _, field := range game.Fields {
		if field.Id == id {
			return field
		}
	}
	return nil
}

func (game *Game) HandleEvent(fieldEvent FieldEvent) ([]*GameEvent, error) {
	targetField := game.getFieldAt(fieldEvent.FieldId)
	if targetField != nil {
		// Check that event.key and field.key match
		if fieldEvent.Key != targetField.Key {
			// Currently only log a message. In the future return an error to the client
			fmt.Printf("Invalid key for field %d. Expected %s, got %s\n", fieldEvent.FieldId, targetField.Key, fieldEvent.Key)
			//return nil, fmt.Errorf("Invalid key! Player unauthorized")
		}
		return targetField.HandleEvent(fieldEvent.Payload, game.Fields, game.Config)
	}
	return []*GameEvent{}, fmt.Errorf("Field not found")
}

func (game *Game) Update(delta float64) []*GameEvent {
	events := game.events
	game.events = []*GameEvent{}
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
			events = append(events, &GameEvent{
				Type: "playerUpdated",
				Payload: PlayerUpdatedEvent{
					FieldId: field.Id,
					Player:  field.Player,
				},
			})
		}
		game.IncomeCooldown = float64(game.Config.IncomeCooldown)
	}

	game.Elapsed += delta
	for i := len(game.Fields) - 1; i >= 0; i-- {
		// Check if player is still alive
		if game.Fields[i].Player.Lives <= 0 {
			// for all mobs and bullets on that field send destroy events
			for _, mob := range game.Fields[i].Mobs {
				events = append(events, &GameEvent{
					Type: "mobDestroyed",
					Payload: MobDestroyedEvent{
						FieldId: game.Fields[i].Id,
						MobId:   mob.Id,
					},
				})
			}
			for _, bullet := range game.Fields[i].Bullets {
				events = append(events, &GameEvent{
					Type: "bulletDestroyed",
					Payload: BulletDestroyedEvent{
						FieldId:  game.Fields[i].Id,
						BulletId: bullet.Id,
					},
				})
			}
			game.Fields = append(game.Fields[:i], game.Fields[i+1:]...)
			continue
		}

		fieldEvents := game.Fields[i].Update(delta)
		// Check all fieldEvents for liveStolen and execute them and take them out of the events
		for j := len(fieldEvents) - 1; j >= 0; j-- {
			if fieldEvents[j].Type == "liveStolen" {
				// Get the field where the live was stolen from
				originField := game.getFieldAt(fieldEvents[j].Payload.(LiveStolenEvent).FieldId)
				// Get the field where the live was stolen to
				targetField := game.getFieldAt(fieldEvents[j].Payload.(LiveStolenEvent).SentFromFieldId)
				// Check if both fields exist
				if originField != nil && targetField != nil {
					// Check if the player has enough lives to steal
					if originField.Player.Lives >= 1 {
						// Steal lives
						originField.Player.Lives -= 1
						targetField.Player.Lives += 1
						// Add events to the event list
						events = append(events, &GameEvent{
							Type: "playerUpdated",
							Payload: PlayerUpdatedEvent{
								FieldId: originField.Id,
								Player:  originField.Player,
							},
						})
						events = append(events, &GameEvent{
							Type: "playerUpdated",
							Payload: PlayerUpdatedEvent{
								FieldId: targetField.Id,
								Player:  targetField.Player,
							},
						})
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
		events = append(events, &GameEvent{
			Type: "gameStateChanged",
			Payload: GameStateChangedEvent{
				GameState: game.State,
			},
		})
		// for all mobs and bullets on that field send destroy events
		for _, mob := range game.Fields[0].Mobs {
			events = append(events, &GameEvent{
				Type: "mobDestroyed",
				Payload: MobDestroyedEvent{
					FieldId: game.Fields[0].Id,
					MobId:   mob.Id,
				},
			})
		}
		for _, bullet := range game.Fields[0].Bullets {
			events = append(events, &GameEvent{
				Type: "bulletDestroyed",
				Payload: BulletDestroyedEvent{
					FieldId:  game.Fields[0].Id,
					BulletId: bullet.Id,
				},
			})
		}
	}
	return events
}

// Return TowerTypes
func (game *Game) TowerTypes() []*TowerType {
	return game.Config.TowerTypes
}

// Return MobTypes
func (game *Game) MobTypes() []*MobType {
	return game.Config.MobTypes
}
