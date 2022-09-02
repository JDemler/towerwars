package game

import (
	"testing"
)

func testBarracks(c Config) *Barracks {
	return newBarracks(&c)
}

// prepare a field containing a single tower and a single mob using the standardtwmap
func prepareField(hasTower bool, hasMob bool, preRunBarracks bool) *Field {
	field := NewField(0, TestGameConfig.Player(0), testBarracks(TestGameConfig), standardTWMap().GenerateMap())
	if hasTower {
		// add tower by handling an event
		_, err := field.HandleEvent(BuildEvent{X: 5, Y: 5, TowerType: "FastBullet"}, []*Field{}, &TestGameConfig)
		if err != nil {
			panic("Failed to build tower")
		}
	}
	if hasMob {
		// add mob by handling an event
		field.Barracks.update(1)
		_, err := field.HandleEvent(BuyMobEvent{MobType: "SlowMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
		if err != nil {
			panic("Failed to buy mob")
		}
	}
	if preRunBarracks {
		for i := 0; i < 100; i++ {
			field.Barracks.update(1)
		}
	}
	return field
}

// Test that when mob reaches end of twmap it is removed from the field and player looses a live
func TestMobReachesEndOfTWMap(t *testing.T) {
	field := prepareField(false, true, true)
	field.Player.Lives = 3
	if len(field.Mobs) != 1 {
		t.Errorf("Expected 1 mob, got %d", len(field.Mobs))
	}
	events := field.Update(1)
	for i := 0; i < 100; i++ {
		// update field and add returned events to events
		events = append(events, field.Update(1)...)
	}
	// check that there is at least one liveStolen Event
	var liveStolenEventFound *liveStolenEvent
	for _, event := range events {
		if lse, ok := event.Payload.(liveStolenEvent); ok {
			liveStolenEventFound = &lse
		}
	}
	if liveStolenEventFound == nil {
		t.Error("Expected LiveStolenEvent")
	}
	if liveStolenEventFound.FieldID != 0 {
		t.Errorf("Expected FieldId 0, got %d", liveStolenEventFound.FieldID)
	}
	if liveStolenEventFound.SentFromFieldID != 0 {
		t.Errorf("Expected SentFromFieldId 1, got %d", liveStolenEventFound.SentFromFieldID)
	}
	if len(field.Mobs) != 0 {
		t.Errorf("Expected 0 mob, got %d", len(field.Mobs))
		// print mob X and Y to see if they are correct
		for _, mob := range field.Mobs {
			t.Errorf("Mob X: %f, Y: %f", mob.X, mob.Y)
		}
	}
}

// Test that a bullet gets removed when its target reaches end of twmap
func TestBulletReachesEndOfTWMap(t *testing.T) {
	field := prepareField(false, true, true)
	// Add bullet with 0 speed to field and targeting only mob on field
	field.Bullets = append(field.Bullets, &Bullet{X: 0, Y: 0, Target: field.Mobs[0], Speed: 0})
	if len(field.Bullets) != 1 {
		t.Errorf("Expected 1 bullet, got %d", len(field.Bullets))
	}
	for i := 0; i < 100; i++ {
		field.Update(1)
	}
	if len(field.Bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(field.Bullets))
	}
}

// Test that a bullet gets removed when its target reaches end of twmap and there is another mob
func TestBulletReachesEndOfTWMapAndAnotherMob(t *testing.T) {
	field := prepareField(false, true, true)
	// Add bullet with 0 speed to field and targeting only mob on field
	field.Bullets = append(field.Bullets, &Bullet{X: 0, Y: 0, Target: field.Mobs[0], Speed: 0})
	field.Mobs = append(field.Mobs, &Mob{X: 1, Y: 50, Health: 123, Speed: 0})
	if len(field.Bullets) != 1 {
		t.Errorf("Expected 1 bullet, got %d", len(field.Bullets))
	}
	if len(field.Mobs) != 2 {
		t.Errorf("Expected 2 mob, got %d", len(field.Mobs))
	}

	for i := 0; i < 40; i++ {
		field.Update(1)
	}
	if len(field.Mobs) != 1 {
		t.Errorf("Expected 1 mob, got %d", len(field.Mobs))
	}
	if len(field.Bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(field.Bullets))
	}
}

// Test that a BuyMobEvent reduces the money of the player and increases the income of the player
func TestBuyMobEvent(t *testing.T) {
	field := prepareField(false, false, true)
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "FastMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	if field.Player.Money != 9500 {
		t.Errorf("Expected 9500 money, got %d", field.Player.Money)
	}
	if field.Player.Income != 11 {
		t.Errorf("Expected 11 income, got %d", field.Player.Income)
	}
}

// Test that a BuyMobEvent is not executed when Player does not have enough money
func TestBuyMobEventNotExecuted(t *testing.T) {
	sourceField := prepareField(false, false, true)
	sourceField.Player.Money = 0
	targetField := prepareField(false, false, true)
	targetField.ID = 1
	// Check that target field has no mobs
	if len(targetField.Mobs) != 0 {
		t.Errorf("Expected 0 mob, got %d", len(targetField.Mobs))
	}
	_, err := sourceField.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "FastMob", TargetFieldID: 1}, []*Field{targetField}, &TestGameConfig)
	if err == nil {
		t.Errorf("Expected BuyMobEvent to not be executed")
	}
	if len(targetField.Mobs) != 0 {
		t.Error("Expected no mob")
	}
}

// Test that tower is created when a buy tower event is received
func TestBuyTower(t *testing.T) {
	field := prepareField(false, false, true)
	// Test that 1,1 is not occupied before BuyTowerEvent is executed
	if field.TWMap.isOccupied(1, 1) {
		t.Error("Expected 1,1 to be empty")
	}

	_, err := field.HandleEvent(BuildEvent{X: 1, Y: 1, TowerType: "FastBullet"}, []*Field{}, &TestGameConfig)
	if err != nil {
		t.Error("Expected tower to be built")
	}
	if len(field.Towers) != 1 {
		t.Errorf("Expected 1 tower, got %d", len(field.Towers))
	}
	if field.TWMap.isOccupied(1, 1) != true {
		t.Error("Expected TWMap is occupied at 1, 1")
	}
}

// Test that player gets money when a mob is killed
func TestMobKilled(t *testing.T) {
	field := prepareField(true, true, true)
	field.Towers[0].Damage = 200
	field.Towers[0].BulletSpeed = 200
	field.Player.Money = 100
	field.Mobs[0].Speed = 0
	field.Mobs[0].Reward = 10
	// Check that mob is alive
	if field.Mobs[0].Health != 100 {
		t.Errorf("Expected mob health to be 100, got %d", field.Mobs[0].Health)
	}
	for i := 0; i < 100; i++ {
		field.Update(1)
	}
	// Check that there is no mob
	if len(field.Mobs) != 0 {
		t.Errorf("Expected 0 mob, got %d", len(field.Mobs))
	}
	if field.Player.Money != 110 {
		t.Errorf("Expected 110 money, got %d", field.Player.Money)
	}
}

// Test that mobs get a unique ascending id
func TestMobId(t *testing.T) {
	field := prepareField(false, true, true)
	// add mob by handling an event
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "FastMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	// check mob ids
	if field.Mobs[0].ID != 1 {
		t.Errorf("Expected mob id to be 0, got %d", field.Mobs[0].ID)
	}
	if field.Mobs[1].ID != 2 {
		t.Errorf("Expected mob id to be 1, got %d", field.Mobs[1].ID)
	}
	if field.Mobs[0].ID == field.Mobs[1].ID {
		t.Error("Expected mobs to have different but ascending ids")
	}
	// let mobs finish
	for i := 0; i < 100; i++ {
		field.Update(1)
	}
	// add mob by handling an event
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "FastMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	if field.Mobs[0].ID != 3 {
		t.Error("Expected mobs to have different but ascending ids")
	}
}

// Test that bullets have a unique ascending id
func TestBulletId(t *testing.T) {
	field := prepareField(true, true, true)
	// check to see there are no bullets
	if len(field.Bullets) != 0 {
		t.Errorf("Expected 0 bullets, got %d", len(field.Bullets))
	}
	// update field to let tower shoot
	field.Update(0.01)
	field.Update(1.01)

	// check to see there is 1 bullet
	if len(field.Bullets) != 2 {
		t.Errorf("Expected 2 bullet, got %d", len(field.Bullets))
	}
	// check bullet ids
	if field.Bullets[0].ID != 1 {
		t.Errorf("Expected bullet id to be 0, got %d", field.Bullets[0].ID)
	}
	if field.Bullets[1].ID != 2 {
		t.Errorf("Expected bullet id to be 1, got %d", field.Bullets[1].ID)
	}
	if field.Bullets[0].ID == field.Bullets[1].ID {
		t.Error("Expected bullets to have different but ascending ids")
	}
	// let bullets finish
	for i := 0; i < 100; i++ {
		field.Update(1)
	}
	// check that there are no bullets and no mobs on the field
	if len(field.Bullets) != 0 {
		t.Errorf("Expected 0 bullets, got %d", len(field.Bullets))
	}
	if len(field.Mobs) != 0 {
		t.Errorf("Expected 0 mobs, got %d", len(field.Mobs))
	}
	// add mob by handling an event
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "StationaryMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	// add bullet by updating field
	field.Update(0.01)
	// check to see there is 1 bullet
	if len(field.Bullets) != 1 {
		t.Errorf("Expected 1 bullet, got %d", len(field.Bullets))
	}
	// other bullets have been fired, so the id should be higher than 3
	if field.Bullets[0].ID <= 3 {
		t.Errorf("Expected bullets to have different but ascending ids: %d", field.Bullets[0].ID)
	}
}

// Test that towers can be upgraded with the UpgradeTowerEvent
func TestUpgradeTower(t *testing.T) {
	field := prepareField(false, false, true)
	// Test that 1,1 is not occupied before BuyTowerEvent is executed
	if field.TWMap.isOccupied(1, 1) {
		t.Error("Expected 1,1 to be empty")
	}

	// Buy tower
	_, err := field.HandleEvent(BuildEvent{X: 1, Y: 1, TowerType: "SlowBullet"}, []*Field{}, &TestGameConfig)
	if err != nil {
		t.Error("Expected tower to be built")
	}
	if len(field.Towers) != 1 {
		t.Errorf("Expected 1 tower, got %d", len(field.Towers))
	}
	if field.TWMap.isOccupied(1, 1) != true {
		t.Error("Expected TWMap is occupied at 1, 1")
	}
	// Upgrade tower
	_, err = field.HandleEvent(UpgradeEvent{TowerID: 1}, []*Field{}, &TestGameConfig)
	if err != nil {
		t.Errorf("Expected tower to be upgraded but got %s", err)
	}
	if field.Towers[0].Damage != 10 {
		t.Errorf("Expected tower damage to be 10, got %d", field.Towers[0].Damage)
	}
	// Upgrade tower
	_, err = field.HandleEvent(UpgradeEvent{TowerID: 1}, []*Field{}, &TestGameConfig)
	if err != nil {
		t.Errorf("Expected tower to be upgraded but got %s", err)
	}
	if field.Towers[0].Damage != 15 {
		t.Errorf("Expected tower damage to be 15, got %d", field.Towers[0].Damage)
	}
}

// Test that selling a tower frees up the path and gives money back to the player
func TestSellTower(t *testing.T) {
	field := prepareField(false, false, true)
	// Test that 1,1 is not occupied before BuyTowerEvent is executed
	if field.TWMap.isOccupied(2, 0) {
		t.Error("Expected 1,1 to be empty")
	}
	// Buy tower
	_, err := field.HandleEvent(BuildEvent{X: 1, Y: 1, TowerType: "SlowBullet"}, []*Field{}, &TestGameConfig)
	if err != nil {
		t.Error("Expected tower to be built")
	}
	if len(field.Towers) != 1 {
		t.Errorf("Expected 1 tower, got %d", len(field.Towers))
	}
	if field.TWMap.isOccupied(1, 1) != true {
		t.Error("Expected TWMap is occupied at 1, 1")
	}
	// Sell tower
	_, err = field.HandleEvent(SellEvent{TowerID: 1}, []*Field{}, &TestGameConfig)
	if err != nil {
		t.Errorf("Expected tower to be sold but got %s", err)
	}
	if len(field.Towers) != 0 {
		t.Errorf("Expected 0 towers, got %d", len(field.Towers))
	}
	if field.TWMap.isOccupied(1, 1) != false {
		t.Error("Expected TWMap is not occupied at 1, 1")
	}
	// 100 - 15 + (15 * 0.8) = 97
	if field.Player.Money != 9700 {
		t.Errorf("Expected 97 money, got %d", field.Player.Money)
	}
}

// Test that splash damage also hits mobs in the splash radius
func TestSplashDamage(t *testing.T) {
	field := prepareField(false, false, true)
	// add mob by handling an event
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "StationaryMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "StationaryMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "StationaryMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "StationaryMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	field.HandleEvent(BuyMobEvent{fieldID: 0, MobType: "StationaryMob", TargetFieldID: 0}, []*Field{field}, &TestGameConfig)
	// add tower by handling an event
	field.HandleEvent(BuildEvent{X: 1, Y: 1, TowerType: "SplashBullet"}, []*Field{field}, &TestGameConfig)
	// Firerate of 1 = 10DPS without splash = 50s to kill 5 mobs
	// Firerate of 1 = 10DPS + 5DPS splash < 50s to kill 5 mobs
	for i := 0; i < 25; i++ {
		field.Update(1)
	}
	// check that there are no bullets and no mobs on the field
	if len(field.Bullets) != 0 {
		t.Errorf("Expected 0 bullets, got %d", len(field.Bullets))
	}
	if len(field.Mobs) != 0 {
		t.Errorf("Expected 0 mobs, got %d", len(field.Mobs))
	}
}
