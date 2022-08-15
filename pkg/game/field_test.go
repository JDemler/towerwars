package game

import (
	"testing"
)

// prepare a field containing a single tower and a single mob using the standardtwmap
func prepareField(hasTower bool, hasMob bool) *Field {
	field := NewField(0, NewPlayer(), standardTWMap())
	if hasTower {
		// add tower by handling an event
		if (!field.HandleEvent(BuildEvent{fieldId: 0, X: 5, Y: 5, TowerType: "FastBullet"}, []*Field{}, &TestGameConfig)) {
			panic("Failed to build tower")
		}
	}
	if hasMob {
		// add mob by handling an event
		if (!field.HandleEvent(BuyMobEvent{fieldId: 0, MobType: "SlowMob", TargetFieldId: 0}, []*Field{field}, &TestGameConfig)) {
			panic("BuyMobEvent failed")
		}

	}
	return field
}

// Test that when mob reaches end of twmap it is removed from the field and player looses a live
func TestMobReachesEndOfTWMap(t *testing.T) {
	field := prepareField(false, true)
	field.Player.Lives = 3
	if len(field.Mobs) != 1 {
		t.Errorf("Expected 1 mob, got %d", len(field.Mobs))
	}
	for i := 0; i < 100; i++ {
		field.Update(1)
	}
	if len(field.Mobs) != 0 {
		t.Errorf("Expected 0 mob, got %d", len(field.Mobs))
		// print mob X and Y to see if they are correct
		for _, mob := range field.Mobs {
			t.Errorf("Mob X: %f, Y: %f", mob.X, mob.Y)
		}
	}
	if field.Player.Lives != 2 {
		t.Errorf("Expected 2 lives, got %d", field.Player.Lives)
	}
}

// Test that a bullet gets removed when its target reaches end of twmap
func TestBulletReachesEndOfTWMap(t *testing.T) {
	field := prepareField(false, true)
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
	field := prepareField(false, true)
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
	field := prepareField(false, false)
	field.HandleEvent(BuyMobEvent{fieldId: 0, MobType: "Circle", TargetFieldId: 0}, []*Field{field}, &StandardGameConfig)
	if field.Player.Money != 90 {
		t.Errorf("Expected 90 money, got %d", field.Player.Money)
	}
	if field.Player.Income != 12 {
		t.Errorf("Expected 11 income, got %d", field.Player.Income)
	}
}

// Test that a BuyMobEvent is not executed when Player does not have enough money
func TestBuyMobEventNotExecuted(t *testing.T) {
	sourceField := prepareField(false, false)
	sourceField.Player.Money = 0
	targetField := prepareField(false, false)
	targetField.Id = 1
	// Check that target field has no mobs
	if len(targetField.Mobs) != 0 {
		t.Errorf("Expected 0 mob, got %d", len(targetField.Mobs))
	}
	if sourceField.HandleEvent(BuyMobEvent{fieldId: 0, MobType: "Circle", TargetFieldId: 1}, []*Field{targetField}, &StandardGameConfig) {
		t.Errorf("Expected BuyMobEvent to not be executed")
	}
	if len(targetField.Mobs) != 0 {
		t.Error("Expected no mob")
	}
}

// Test that tower is created when a buy tower event is received
func TestBuyTower(t *testing.T) {
	field := prepareField(false, false)
	// Test that 1,1 is not occupied before BuyTowerEvent is executed
	if field.TWMap.IsOccupied(1, 1) {
		t.Error("Expected 1,1 to be empty")
	}

	if !field.HandleEvent(BuildEvent{fieldId: 0, X: 1, Y: 1, TowerType: "Arrow"}, []*Field{}, &StandardGameConfig) {
		t.Error("Expected tower to be built")
	}
	if len(field.Towers) != 1 {
		t.Errorf("Expected 1 tower, got %d", len(field.Towers))
	}
	if field.TWMap.IsOccupied(1, 1) != true {
		t.Error("Expected TWMap is occupied at 1, 1")
	}
}

// Test that player gets money when a mob is killed
func TestMobKilled(t *testing.T) {
	field := prepareField(true, true)
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
	field := prepareField(false, true)
	// add mob by handling an event
	field.HandleEvent(BuyMobEvent{fieldId: 0, MobType: "Circle", TargetFieldId: 0}, []*Field{field}, &StandardGameConfig)
	// check mob ids
	if field.Mobs[0].Id != 1 {
		t.Errorf("Expected mob id to be 0, got %d", field.Mobs[0].Id)
	}
	if field.Mobs[1].Id != 2 {
		t.Errorf("Expected mob id to be 1, got %d", field.Mobs[1].Id)
	}
	if field.Mobs[0].Id == field.Mobs[1].Id {
		t.Error("Expected mobs to have different but ascending ids")
	}
	// let mobs finish
	for i := 0; i < 100; i++ {
		field.Update(1)
	}
	// add mob by handling an event
	field.HandleEvent(BuyMobEvent{fieldId: 0, MobType: "Circle", TargetFieldId: 0}, []*Field{field}, &StandardGameConfig)
	if field.Mobs[0].Id != 3 {
		t.Error("Expected mobs to have different but ascending ids")
	}
}

// Test that bullets have a unique ascending id
func TestBulletId(t *testing.T) {
	field := prepareField(true, true)
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
	if field.Bullets[0].Id != 1 {
		t.Errorf("Expected bullet id to be 0, got %d", field.Bullets[0].Id)
	}
	if field.Bullets[1].Id != 2 {
		t.Errorf("Expected bullet id to be 1, got %d", field.Bullets[1].Id)
	}
	if field.Bullets[0].Id == field.Bullets[1].Id {
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
	field.HandleEvent(BuyMobEvent{fieldId: 0, MobType: "StationaryMob", TargetFieldId: 0}, []*Field{field}, &TestGameConfig)
	// add bullet by updating field
	field.Update(0.01)
	// check to see there is 1 bullet
	if len(field.Bullets) != 1 {
		t.Errorf("Expected 1 bullet, got %d", len(field.Bullets))
	}
	// other bullets have been fired, so the id should be higher than 3
	if field.Bullets[0].Id <= 3 {
		t.Errorf("Expected bullets to have different but ascending ids: %d", field.Bullets[0].Id)
	}
}
