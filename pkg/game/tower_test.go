package game

import (
	"testing"
)

// Test that tower shoots at a mob when in range
func TestTowerShootsAtMob(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 0}
	mob := Mob{X: 0, Y: 0, Health: 100}
	bullets := tower.Update(0, []*Mob{&mob})
	if len(bullets) != 1 {
		t.Errorf("Expected 1 bullet, got %d", len(bullets))
	}
	if *bullets[0].Target != mob {
		t.Errorf("Expected bullet to target mob, got %v", bullets[0].Target)
	}
}

// Test that tower does not shoot at mob when out of range
func TestTowerDoesNotShootAtMob(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 0}
	mob := Mob{X: 2, Y: 2, Health: 100}
	bullets := tower.Update(0, []*Mob{&mob})
	if len(bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(bullets))
	}
}

// Test that tower does not shoot at mob when cooldown is not finished
func TestTowerDoesNotShootAtMobWhenCooldownIsNotFinished(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 1}
	mob := Mob{X: 0, Y: 0, Health: 100}
	bullets := tower.Update(0, []*Mob{&mob})
	if len(bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(bullets))
	}
}

// Test that tower update reduces cooldown
func TestTowerUpdateReducesCooldown(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 1}
	bullets := tower.Update(1, []*Mob{})
	if tower.Cooldown != 0 {
		t.Errorf("Expected cooldown to be 0, got %f", tower.Cooldown)
	}
	if len(bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(bullets))
	}
}
