package game

import (
	"math"
)

const TileSize = 32

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
		Fields: []*Field{
			NewField(0, standardTWMap()),
			NewField(1, standardTWMap())},
		Elapsed:        0,
		MobRespawnTime: 5,
		IncomeCooldown: 30,
	}
}

func (game *Game) Update(delta float64, events []FieldEvent) {
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
		//Get relevant InputEvents for this field
		fieldEvents := []Event{}
		for _, event := range events {
			if event.FieldId == game.Fields[i].Id {
				fieldEvents = append(fieldEvents, event.Unpack())
			}
		}
		game.Fields[i].Update(delta, fieldEvents, game.Fields)
	}
}
