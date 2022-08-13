package game

import (
	"testing"
)

// Function that prepares a game to test with
func prepareGame() *Game {
	return &Game{
		Fields: []*Field{
			NewField(0, NewPlayer(), standardTWMap()),
			NewField(1, NewPlayer(), standardTWMap())},
		Elapsed:        0,
		MobRespawnTime: 5,
		IncomeCooldown: 30,
		State:          WaitingState,
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
	game.Start()
	// iterate over fields and players and check that players have 100 money
	for _, field := range game.Fields {
		if field.Player.Money != 100 {
			t.Errorf("Expected player to have 100 money, got %d", field.Player.Money)
		}
	}
	// run update loop
	for i := 0; i < 31; i++ {
		game.Update(1)
	}
	// Check that every player has money + income
	for _, field := range game.Fields {
		if field.Player.Money != 100+field.Player.Income {
			t.Errorf("Expected player to have 100+income money, got %d", field.Player.Money)
		}
	}
}

// Test that state is correct throughout the game
func TestGameState(t *testing.T) {
	game := prepareGame()
	// Check that state is waiting
	if game.State != WaitingState {
		t.Errorf("Expected state to be waiting, got %s", game.State)
	}
	game.Start()
	// Check that state is playing after start
	if game.State != PlayingState {
		t.Errorf("Expected state to be playing, got %s", game.State)
	}
	// Set live of all players to 1 and add mob
	game.Fields[0].Player.Lives = 1
	game.Fields[0].Mobs = append(game.Fields[0].Mobs, &Mob{X: 5, Y: 5, TargetX: 5, TargetY: 5, Health: 100, Speed: 100})
	// run the game
	for i := 0; i < 31; i++ {
		game.Update(1)
	}
	// Check that mob reached is target and is thus removed from the game
	if len(game.Fields[0].Mobs) != 0 {
		t.Errorf("Expected mob to be removed, got %d", len(game.Fields[0].Mobs))
	}
	// Check that state is GameOver after end of game
	if game.State != GameOverState {
		t.Errorf("Expected state to be waiting, got %s", game.State)
	}
}
