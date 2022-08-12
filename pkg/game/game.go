package game

import (
	"math"
)

const TileSize = 32
const WaitingState = "WaitingForPlayers"
const PlayingState = "Playing"
const GameOverState = "GameOver"

type Player struct {
	Money  int
	Income int
	Lives  int
}

type Game struct {
	Fields         []*Field
	Elapsed        float64
	IncomeCooldown float64
	MobRespawnTime float64
	State          string
}

func NewPlayer() *Player {
	return &Player{
		Money:  100,
		Income: 10,
		Lives:  3,
	}
}

func NewGame() *Game {
	return &Game{
		Fields:         []*Field{},
		Elapsed:        0,
		MobRespawnTime: 5,
		IncomeCooldown: 30,
		State:          WaitingState,
	}
}

// Add Player to Game
func (game *Game) AddPlayer(player *Player) {
	game.Fields = append(game.Fields, NewField(len(game.Fields), player, standardTWMap()))
}

// Start game if there are more than two players
func (game *Game) Start() {
	if len(game.Fields) < 2 {
		return
	}
	game.State = PlayingState
}

func (game *Game) Update(delta float64, events []FieldEvent) {
	// Only do something when the game is playing
	if game.State != PlayingState {
		return
	}
	// reduce income cooldown
	game.IncomeCooldown = math.Max(game.IncomeCooldown-delta, 0)
	// when income cooldown is 0 payout
	if game.IncomeCooldown == 0 {
		for _, field := range game.Fields {
			field.Payout()
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

		//Get relevant InputEvents for this field
		fieldEvents := []Event{}
		for _, event := range events {
			if event.FieldId == game.Fields[i].Id {
				fieldEvents = append(fieldEvents, event.Unpack())
			}
		}
		game.Fields[i].Update(delta, fieldEvents, game.Fields)
	}
	// Set game over if there is only one player left
	if len(game.Fields) <= 1 {
		game.State = GameOverState
	}
}
