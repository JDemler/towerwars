package game

import (
	"testing"
)

// Test that bullet moves towards target in X direction
func TestBulletMovesTowardsTargetInXDirection(t *testing.T) {
	targetMob := Mob{X: 1, Y: 0, Health: 100, TargetX: 0, TargetY: 0, Speed: 1}
	bullet := Bullet{X: 0, Y: 0, Speed: 1, Target: &targetMob}
	bullet.Update(0.1)
	if bullet.X != 0.1 {
		t.Errorf("Expected X to be 0.1, got %f", bullet.X)
	}
	if bullet.Y != 0 {
		t.Errorf("Expected Y to be 0, got %f", bullet.Y)
	}
}

// Test that bullet moves towards target in Y direction
func TestBulletMovesTowardsTargetInYDirection(t *testing.T) {
	targetMob := Mob{X: 0, Y: 1, Health: 100, TargetX: 0, TargetY: 0, Speed: 1}
	bullet := Bullet{X: 0, Y: 0, Speed: 1, Target: &targetMob}
	bullet.Update(0.1)
	if bullet.X != 0 {
		t.Errorf("Expected X to be 0, got %f", bullet.X)
	}
	if bullet.Y != 0.1 {
		t.Errorf("Expected Y to be 0.1, got %f", bullet.Y)
	}
}

// Test that bullet moves towards target in x and y direction
func TestBulletMovesTowardsTargetInXAndYDirection(t *testing.T) {
	targetMob := Mob{X: 1, Y: 1, Health: 100, TargetX: 0, TargetY: 0, Speed: 1}
	bullet := Bullet{X: 0, Y: 0, Speed: 1, Target: &targetMob}
	bullet.Update(0.1)
	if bullet.X < 0.07 {
		t.Errorf("Expected X to be 0.1, got %f", bullet.X)
	}
	if bullet.Y < 0.07 {
		t.Errorf("Expected Y to be 0.1, got %f", bullet.Y)
	}
}

// Test that bullet hits target when speed exceeds distance
func TestBulletHitsTargetWhenSpeedExceedsDistrance(t *testing.T) {
	targetMob := Mob{X: 0, Y: 0, Health: 100, TargetX: 1, TargetY: 1, Speed: 1}
	bullet := Bullet{X: 0, Y: 0, Speed: 2, Target: &targetMob, Damage: 10}
	alive := bullet.Update(2)
	if alive {
		t.Errorf("Expected bullet to be dead")
	}
	if targetMob.Health != 90 {
		t.Errorf("Expected target mob health to be 90, got %d", targetMob.Health)
	}
}
