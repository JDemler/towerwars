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
	Id     int `json:"id"`
	Money  int `json:"money"`
	Income int `json:"income"`
	Lives  int `json:"lives"`
}

type Game struct {
	Fields         []*Field     `json:"fields"`
	Elapsed        float64      `json:"elapsed"`
	IncomeCooldown float64      `json:"incomeCooldown"`
	MobRespawnTime float64      `json:"-"`
	State          string       `json:"state"`
	config         *GameConfig  `json:"-"`
	events         []*GameEvent `json:"-"`
}

func NewGame() *Game {
	return &Game{
		Fields:         []*Field{},
		Elapsed:        0,
		MobRespawnTime: 5,
		IncomeCooldown: 30,
		State:          WaitingState,
		config:         &StandardGameConfig,
	}
}

// Add Player to Game
func (game *Game) AddPlayer() {
	player := &Player{
		Id:     len(game.Fields),
		Money:  game.config.StartStats.Money,
		Income: game.config.StartStats.Income,
		Lives:  game.config.StartStats.Lives,
	}
	game.Fields = append(game.Fields, NewField(len(game.Fields), player, game.config.TWMap()))
	game.events = append(game.events, &GameEvent{
		Type: "playerJoined",
		Payload: PlayerJoinedEvent{
			Player: player,
		},
	})

}

// Start game if there are more than two players
func (game *Game) Start() {
	if len(game.Fields) < 2 {
		return
	}
	game.State = PlayingState
	game.events = append(game.events, &GameEvent{
		Type: "gameStarted",
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
	event := fieldEvent.Unpack()
	if event == nil {
		return nil, fmt.Errorf("Invalid event")
	}
	targetField := game.getFieldAt(event.FieldId())
	if targetField != nil {
		return targetField.HandleEvent(event, game.Fields, game.config)
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
		game.IncomeCooldown = 30
	}

	game.Elapsed += delta
	for i := len(game.Fields) - 1; i >= 0; i-- {
		// Check if player is still alive
		if game.Fields[i].Player.Lives <= 0 {
			game.Fields = append(game.Fields[:i], game.Fields[i+1:]...)
			continue
		}

		fieldEvents := game.Fields[i].Update(delta)
		events = append(events, fieldEvents...)
	}
	// Set game over if there is only one player left
	if len(game.Fields) <= 1 {
		game.State = GameOverState
	}
	return events
}

// Return TowerTypes
func (game *Game) TowerTypes() []*TowerType {
	return game.config.TowerTypes
}

// Return MobTypes
func (game *Game) MobTypes() []*MobType {
	return game.config.MobTypes
}
