package game

import (
	"testing"
)

// Test that mob moves towards target in X direction
func TestMobMovesTowardsTargetInXDirection(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 100, TargetX: 1, TargetY: 0, Speed: 1}
	twmap := standardTWMap()
	mob.Update(0.1, twmap, 0)
	if mob.X != 0.1 {
		t.Errorf("Expected X to be 0.1, got %f", mob.X)
	}
	if mob.Y != 0 {
		t.Errorf("Expected Y to be 0, got %f", mob.Y)
	}
}

// Test that mob moves towards target in Y direction
func TestMobMovesTowardsTargetInYDirection(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 100, TargetX: 0, TargetY: 1, Speed: 1}
	twmap := standardTWMap()
	mob.Update(0.1, twmap, 0)
	if mob.X != 0 {
		t.Errorf("Expected X to be 0, got %f", mob.X)
	}
	if mob.Y != 0.1 {
		t.Errorf("Expected Y to be 0.1, got %f", mob.Y)
	}
}

// Test that mob moves towards target in x and y direction
func TestMobMovesTowardsTargetInXAndYDirection(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 100, TargetX: 1, TargetY: 1, Speed: 1}
	twmap := standardTWMap()
	mob.Update(0.1, twmap, 0)
	if mob.X < 0.07 {
		t.Errorf("Expected X to be 0.1, got %f", mob.X)
	}
	if mob.Y < 0.07 {
		t.Errorf("Expected Y to be 0.1, got %f", mob.Y)
	}
}

// Test that mob stops at target when speed exceeds distance
func TestMobStopsAtTargetWhenSpeedExceedsDistrance(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 100, TargetX: 1, TargetY: 1, Speed: 1}
	twmap := standardTWMap()
	mob.Update(2, twmap, 0)
	if mob.X != 1 {
		t.Errorf("Expected X to be 1, got %f", mob.X)
	}
	if mob.Y != 1 {
		t.Errorf("Expected Y to be 1, got %f", mob.Y)
	}
}

// Test that mob is still alive when health is greater than 0
func TestMobIsStillAliveWhenHealthIsGreaterThanZero(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 100, TargetX: 1, TargetY: 1, Speed: 1}
	twmap := standardTWMap()
	mob.Update(0.1, twmap, 0)
	if mob.Health <= 0 {
		t.Error("Expected mob to be alive")
	}
}

// Test that mob is dead when health is 0
func TestMobIsDeadWhenHealthIsZero(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 0, TargetX: 1, TargetY: 1, Speed: 1}
	twmap := standardTWMap()
	mob.Update(0.1, twmap, 0)
	if mob.Health > 0 {
		t.Error("Expected mob to be dead")
	}
}

// Test that mob gets new target when target is reached
func TestMobGetsNewTargetWhenTargetIsReached(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 100, TargetX: 0, TargetY: 0, Speed: 1}
	twmap := standardTWMap()
	mob.Update(1, twmap, 0)
	if mob.TargetX != TileSize+TileSize/2 {
		t.Errorf("Expected TargetX to be 0, got %f", mob.TargetX)
	}
	if mob.TargetY != TileSize+TileSize/2 {
		t.Errorf("Expected TargetY to be 0, got %f", mob.TargetY)
	}
}

// Test that mobs health is set to 0 when it reaches end of twmap
func TestMobHealthIsSetToZeroWhenItReachesEndOfTWMap(t *testing.T) {
	mob := Mob{X: 0, Y: 0, Health: 100, TargetX: 0, TargetY: 0, Speed: 10}
	twmap := standardTWMap()
	for i := 0; i < 100; i++ {
		mob.Update(1, twmap, 0)
	}
	if !mob.IsDead() {
		t.Error("Expected mob to be dead")
	}
}
