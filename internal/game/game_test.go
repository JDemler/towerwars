package game

import (
	"testing"
)

// Function that prepares a game to test with
func prepareGame() *Game {
	game := Game{
		Fields:         []*Field{},
		Elapsed:        0,
		IncomeCooldown: 1,
		State:          WaitingState,
		Config:         &TestGameConfig,
	}
	game.AddPlayer("test1")
	game.AddPlayer("test2")
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
	if playerJoinedEvents[0].Type != "player" && playerJoinedEvents[1].Kind != "update" {
		t.Errorf("Expected event type to be playerJoined, got %s", playerJoinedEvents[0].Type)
	}
	if playerJoinedEvents[1].Type != "player" && playerJoinedEvents[1].Kind != "update" {
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
	events := game.Update(0)
	// Find index of event with type gameStateChanged
	index := -1
	for i, event := range events {
		if event.Type == "gameStateChanged" {
			index = i
			break
		}
	}
	if index == -1 {
		t.Errorf("Expected gameStarted event, got none")
	}
	// Check that events payload can be casted to GameStateChangedEvent
	gameStateChangedEventPayload := events[index].Payload.(StateChangedEvent)
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
		if field.Player.Money != 10000 {
			t.Errorf("Expected player to have 100 money, got %d", field.Player.Money)
		}
	}

	game.Update(1)

	// Check that every player has money + income
	for _, field := range game.Fields {
		if field.Player.Money != 10000+field.Player.Income {
			t.Errorf("Expected player to have %d, got %d", 10000+field.Player.Income, field.Player.Money)
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
	// Update Barracks
	game.Update(1)
	// Send mob to field 0 by executing an event
	_, err := game.HandleEvent(FieldEvent{FieldID: 1, Type: "buyMob", Payload: BuyMobEvent{MobType: "FastMob", TargetFieldID: 0}})
	if err != nil {
		t.Errorf("Expected no error, got %s", err)
	}
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
		t.Errorf("Expected state to be GameOver, got %s", game.State)
	}
}

// Test that building a tower on one field does not occupy the other field
func TestBuildTower(t *testing.T) {
	game := prepareGame()
	game.Start()
	// Build tower on field 1
	_, err := game.HandleEvent(FieldEvent{FieldID: 1, Type: "buildTower", Payload: BuildEvent{X: 1, Y: 1, TowerKey: "FastBullet"}})
	if err != nil {
		t.Errorf("Expected no error, got %s", err)
	}
	// Check that field 0 is not occupied
	if game.Fields[0].TWMap.isOccupied(1, 1) {
		t.Errorf("Expected field to not be occupied, got true")
	}
}

// Test that buying a mob creats a mob on target field
func TestBuyMob(t *testing.T) {
	game := prepareGame()
	game.Start()
	// Update for Barracks
	game.Update(1)
	// Buy mob on field 0
	_, err := game.HandleEvent(FieldEvent{FieldID: 1, Type: "buyMob", Payload: BuyMobEvent{MobType: "FastMob", TargetFieldID: 0}})
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
	// Find index of event with type gameStateChanged
	index := -1
	for i, event := range gameStateChangedEvent {
		if event.Type == "gameStateChanged" {
			index = i
			break
		}
	}
	if index == -1 {
		t.Errorf("Expected gameStateChanged event, got none")
	}
	if gameStateChangedEvent[index].Type != "gameStateChanged" {
		t.Errorf("Expected gameStateChanged event, got %s", gameStateChangedEvent[index].Type)
	}
	// Check that events payload can be casted to GameStateChangedEvent
	gameStateChangedEventPayload := gameStateChangedEvent[index].Payload.(StateChangedEvent)
	if gameStateChangedEventPayload.GameState != GameOverState {
		t.Errorf("Expected game state to be game over, got %s", gameStateChangedEventPayload.GameState)
	}
}

// Test that when a mob reaches the end of the map a live is stolen
func TestMobReachesEndOfMap(t *testing.T) {
	game := prepareGame()
	game.Start()
	livesP1Before := game.Fields[0].Player.Lives
	livesP2Before := game.Fields[1].Player.Lives
	// Update for Barracks
	game.Update(1)
	// Add mob to field 1 by firing event
	_, err := game.HandleEvent(FieldEvent{FieldID: 1, Type: "buyMob", Payload: BuyMobEvent{MobType: "FastMob", TargetFieldID: 0}})
	if err != nil {
		t.Errorf("Expected no error, got %s", err)
	}
	// Run the game
	for i := 0; i < 31; i++ {
		game.Update(1)
	}
	// Check that player 1 has one less live
	if game.Fields[0].Player.Lives != livesP1Before-1 {
		t.Errorf("Expected player 1 to have %d lives, got %d", livesP1Before-1, game.Fields[0].Player.Lives)
	}
	// Check that player 2 has the same amount of lives
	if game.Fields[1].Player.Lives != livesP2Before+1 {
		t.Errorf("Expected player 2 to have %d lives, got %d", livesP2Before+1, game.Fields[1].Player.Lives)
	}
}
