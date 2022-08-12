package game

import (
	"testing"
)

// Function that prepares a game to test with
func prepareGame() *Game {
	return &Game{
		Fields: []*Field{
			NewField(0, standardTWMap()),
			NewField(1, standardTWMap())},
		Elapsed:        0,
		MobRespawnTime: 5,
		IncomeCooldown: 30,
	}
}

func TestMakeTiles(t *testing.T) {
	tiles := makeTiles(2, 2)
	if len(tiles) != 2 {
		t.Errorf("Expected 2 tiles, got %d", len(tiles))
	}
	if len(tiles[0]) != 2 {
		t.Errorf("Expected 2 tiles in row, got %d", len(tiles[0]))
	}
	if tiles[0][0].X != 0 {
		t.Errorf("Expected X to be 0, got %d", tiles[0][0].X)
	}
	if tiles[0][0].Y != 0 {
		t.Errorf("Expected Y to be 0, got %d", tiles[0][0].Y)
	}
	if tiles[1][1].X != 1 {
		t.Errorf("Expected X to be 1, got %d", tiles[1][1].X)
	}
	if tiles[1][1].Y != 1 {
		t.Errorf("Expected Y to be 1, got %d", tiles[1][1].Y)
	}
}

// Test that player gets money after income loop
func TestPlayerGetsMoneyAfterIncomeLoop(t *testing.T) {
	game := prepareGame()
	// iterate over fields and players and check that players have 100 money
	for _, field := range game.Fields {
		if field.Player.Money != 100 {
			t.Errorf("Expected player to have 100 money, got %d", field.Player.Money)
		}
	}
	// run update loop
	for i := 0; i < 31; i++ {
		game.Update(1, []FieldEvent{})
	}
	// Check that every player has money + income
	for _, field := range game.Fields {
		if field.Player.Money != 100+field.Player.Income {
			t.Errorf("Expected player to have 100+income money, got %d", field.Player.Money)
		}
	}
}
