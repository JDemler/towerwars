package game

import (
	"testing"
)

// prepare a field containing a single tower and a single mob using the standardtwmap
func prepareField(hasTower bool, hasMob bool) *Field {
	field := NewField(2, NewPlayer(), standardTWMap())
	if hasTower {
		field.Towers = append(field.Towers, &Tower{X: 1, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 0})
	}
	if hasMob {
		field.Mobs = append(field.Mobs, &Mob{X: 0, Y: 0, Health: 100, Speed: 51})
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
		field.Update(1, []Event{}, []*Field{})
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
		field.Update(1, []Event{}, []*Field{})
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
		field.Update(1, []Event{}, []*Field{})
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
	field.Update(1, []Event{BuyMobEvent{fieldId: 0, MobType: "Circle"}}, []*Field{})
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
	sourceField.Update(1, []Event{BuyMobEvent{fieldId: 0, MobType: "Circle", TargetFieldId: 1}}, []*Field{targetField})
	if len(targetField.Mobs) != 0 {
		t.Error("Expected no mob")
	}
}

// Test that tower is created when a buy tower event is received
func TestBuyTower(t *testing.T) {
	field := prepareField(false, false)
	field.Update(1, []Event{BuildEvent{fieldId: 0, X: 1, Y: 1, TowerType: "Arrow"}}, []*Field{})
	if len(field.Towers) != 1 {
		t.Errorf("Expected 1 tower, got %d", len(field.Towers))
	}
}

// Test that when a tower is created the tile is occupied
func TestBuildTower(t *testing.T) {
	field := prepareField(false, false)
	field.Update(1, []Event{BuildEvent{fieldId: 0, X: 1, Y: 1, TowerType: "Arrow"}}, []*Field{})
	if field.TWMap.IsOccupied(1, 1) != true {
		t.Error("Expected TWMap is occupied at 1, 1")
	}
}

// Test that player gets money when a mob is killed
func TestMobKilled(t *testing.T) {
	field := prepareField(true, true)
	field.Towers[0].Damage = 200
	field.Towers[0].BulletSpeed = 200
	field.Mobs[0].Speed = 0
	field.Mobs[0].Reward = 10
	// Check that mob is alive
	if field.Mobs[0].Health != 100 {
		t.Errorf("Expected mob health to be 100, got %d", field.Mobs[0].Health)
	}
	for i := 0; i < 100; i++ {
		field.Update(1, []Event{}, []*Field{})
	}
	// Check that there is no mob
	if len(field.Mobs) != 0 {
		t.Errorf("Expected 0 mob, got %d", len(field.Mobs))
	}
	if field.Player.Money != 110 {
		t.Errorf("Expected 110 money, got %d", field.Player.Money)
	}
}
