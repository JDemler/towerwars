package game

import (
	"testing"
)

// Function that prepares a game to test with
func prepareGame() *Game {
	game := Game{
		Fields:         []*Field{},
		Elapsed:        0,
		MobRespawnTime: 5,
		IncomeCooldown: 30,
		State:          WaitingState,
		config:         &TestGameConfig,
	}
	game.AddPlayer()
	game.AddPlayer()
	return &game
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

// When two players join the game, the game should start and send appropriate events
func TestGameStartsWhenTwoPlayersJoin(t *testing.T) {
	game := prepareGame()
	playerJoinedEvents := game.Update(0) //Gets player joined events
	if len(playerJoinedEvents) != 2 {
		t.Errorf("Expected 2 player joined events, got %d", len(playerJoinedEvents))
	}
	// check event type
	if playerJoinedEvents[0].Type != "playerJoined" {
		t.Errorf("Expected event type to be playerJoined, got %s", playerJoinedEvents[0].Type)
	}
	if playerJoinedEvents[1].Type != "playerJoined" {
		t.Errorf("Expected event type to be playerJoined, got %s", playerJoinedEvents[1].Type)
	}
	if game.State != WaitingState {
		t.Errorf("Expected game to be in waiting state, got %s", game.State)
	}
	// Start game
	game.Start()
	// Check that game has started
	if game.State != PlayingState {
		t.Errorf("Expected game to be in playing state, got %s", game.State)
	}
	// Check that gameStarted event was sent
	gameStateChangedEvent := game.Update(0)
	if len(gameStateChangedEvent) != 1 { // two player joined, one game started
		t.Errorf("Expected 1 event, got %d", len(gameStateChangedEvent))
	}
	if gameStateChangedEvent[0].Type != "gameStateChanged" {
		t.Errorf("Expected gameStateChanged event, got %s", gameStateChangedEvent[0].Type)
	}
	// Check that events payload can be casted to GameStateChangedEvent
	gameStateChangedEventPayload := gameStateChangedEvent[0].Payload.(GameStateChangedEvent)
	if gameStateChangedEventPayload.GameState != PlayingState {
		t.Errorf("Expected game state to be playing, got %s", gameStateChangedEventPayload.GameState)
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

// Test that building a tower on one field does not occupy the other field
func TestBuildTower(t *testing.T) {
	game := prepareGame()
	game.Start()
	// Build tower on field 1
	_, err := game.HandleEvent(FieldEvent{FieldId: 1, Type: "buildTower", Payload: BuildEvent{fieldId: 0, X: 1, Y: 1, TowerType: "FastBullet"}.ToJson()})
	if err != nil {
		t.Errorf("Expected no error, got %s", err)
	}
	// Check that field 0 is not occupied
	if game.Fields[0].TWMap.IsOccupied(1, 1) {
		t.Errorf("Expected field to not be occupied, got true")
	}
}

// Test that buying a mob creats a mob on target field
func TestBuyMob(t *testing.T) {
	game := prepareGame()
	game.Start()
	// Buy mob on field 0
	_, err := game.HandleEvent(FieldEvent{FieldId: 1, Type: "buyMob", Payload: BuyMobEvent{fieldId: 1, MobType: "FastMob", TargetFieldId: 0}.ToJson()})
	if err != nil {
		t.Errorf("Expected no error, got %s", err)
	}
	// Check that field 0 has a mob
	if len(game.Fields[0].Mobs) != 1 {
		t.Errorf("Expected field to have 1 mob, got %d", len(game.Fields[1].Mobs))
	}
}

// When game is over gameStateChanged event should be sent
func TestGameOverEvent(t *testing.T) {
	game := prepareGame()
	game.Start()
	game.Update(0)
	// Set live of player 0 to 0
	game.Fields[0].Player.Lives = 0
	// Check that game over event was sent
	gameStateChangedEvent := game.Update(0)
	//debuglog gameStateChangedEvent
	if len(gameStateChangedEvent) != 1 { // one game over
		t.Errorf("Expected 1 event, got %d", len(gameStateChangedEvent))
	}
	if gameStateChangedEvent[0].Type != "gameStateChanged" {
		t.Errorf("Expected gameStateChanged event, got %s", gameStateChangedEvent[0].Type)
	}
	// Check that events payload can be casted to GameStateChangedEvent
	gameStateChangedEventPayload := gameStateChangedEvent[0].Payload.(GameStateChangedEvent)
	if gameStateChangedEventPayload.GameState != GameOverState {
		t.Errorf("Expected game state to be game over, got %s", gameStateChangedEventPayload.GameState)
	}
}
