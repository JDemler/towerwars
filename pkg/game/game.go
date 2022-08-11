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
	MobRespawnTime float64
}

func NewPlayer() Player {
	return Player{
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
	}
}

func (game *Game) Update(delta float64, events []FieldEvent) {

	game.MobRespawnTime = math.Max(game.MobRespawnTime-delta, 0)
	if game.MobRespawnTime == 0 {
		for i := 0; i < len(game.Fields); i++ {
			game.Fields[i].Mobs = append(game.Fields[i].Mobs, &Mob{X: 0, Y: 0, Health: 100, Speed: 30})
		}
		game.MobRespawnTime = 5
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
