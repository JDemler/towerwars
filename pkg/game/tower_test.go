package game

import (
	"testing"
)

// Test that tower shoots at a mob when in range
func TestTowerShootsAtMob(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 0}
	mob := Mob{X: 0, Y: 0, Health: 100}
	bullets := tower.Update(0, []*Mob{&mob}, func() int { return 1 })
	if len(bullets) != 1 {
		t.Errorf("Expected 1 bullet, got %d", len(bullets))
	}
	if *bullets[0].Target != mob {
		t.Errorf("Expected bullet to target mob, got %v", bullets[0].Target)
	}
}

// Test that bullet has correct mobid
func TestBulletHasCorrectMobId(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 0}
	mob := Mob{X: 0, Y: 0, Health: 100, Id: 1}
	bullets := tower.Update(0, []*Mob{&mob}, func() int { return 1 })
	if bullets[0].TargetId != mob.Id {
		t.Errorf("Expected bullet to have mob id %d, got %d", mob.Id, bullets[0].TargetId)
	}
	mob2 := Mob{X: 0, Y: 0, Health: 100, Id: 2}
	bullets = tower.Update(2, []*Mob{&mob2}, func() int { return 2 })
	if bullets[0].TargetId != mob2.Id {
		t.Errorf("Expected bullet to have mob id %d, got %d", mob2.Id, bullets[0].TargetId)
	}
}

// Test that tower does not shoot at mob when out of range
func TestTowerDoesNotShootAtMob(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 0}
	mob := Mob{X: 2, Y: 2, Health: 100}
	bullets := tower.Update(0, []*Mob{&mob}, func() int { return 1 })
	if len(bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(bullets))
	}
}

// Test that tower does not shoot at mob when cooldown is not finished
func TestTowerDoesNotShootAtMobWhenCooldownIsNotFinished(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 1}
	mob := Mob{X: 0, Y: 0, Health: 100}
	bullets := tower.Update(0, []*Mob{&mob}, func() int { return 1 })
	if len(bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(bullets))
	}
}

// Test that tower update reduces cooldown
func TestTowerUpdateReducesCooldown(t *testing.T) {
	tower := Tower{X: 0, Y: 0, Damage: 10, Range: 1, FireRate: 1, Cooldown: 1}
	bullets := tower.Update(1, []*Mob{}, func() int { return 1 })
	if tower.Cooldown != 0 {
		t.Errorf("Expected cooldown to be 0, got %f", tower.Cooldown)
	}
	if len(bullets) != 0 {
		t.Errorf("Expected 0 bullet, got %d", len(bullets))
	}
}
