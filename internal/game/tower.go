package game

import (
	"math"
)

// Tower represents a tower instance in the game
type Tower struct {
	ID           int     `json:"id"`
	X            float64 `json:"x"`
	Y            float64 `json:"y"`
	Damage       float64 `json:"damage"`
	SplashRadius float64 `json:"splash"`
	SplashDmg    float64 `json:"splashDmg"`
	Range        float64 `json:"range"`
	FireRate     float64 `json:"fireRate"`
	Cooldown     float64 `json:"cooldown"`
	Effect       *Effect `json:"-"`
	Level        int     `json:"level"`
	Type         string  `json:"type"`
	BulletSpeed  float64 `json:"-"`
}

// Implement Crud interface
func (t *Tower) getID() int {
	return t.ID
}

// Implement Crud interface
func (t *Tower) getType() string {
	return "tower"
}

// Upgrade tower from towerlevel
func (t *Tower) Upgrade(towerLevel *TowerLevel) {
	t.Damage = towerLevel.Damage
	t.Range = towerLevel.Range
	t.FireRate = towerLevel.FireRate
	t.Effect = towerLevel.Effect
	t.BulletSpeed = towerLevel.BulletSpeed
	t.SplashRadius = towerLevel.SplashRadius
	t.SplashDmg = towerLevel.SplashDmg
	t.Level = towerLevel.Level
}

// Update tower
func (t *Tower) Update(delta float64, mobs []*Mob, getID func() int) []*Bullet {
	t.Cooldown = math.Max((t.Cooldown - delta), 0)
	if t.Cooldown > 0 {
		return []*Bullet{}
	}

	// check if mob is in range of tower
	for j, mob := range mobs {
		//calculate distance to mob
		distance := math.Sqrt(math.Pow(t.X-mob.X, 2) + math.Pow(t.Y-mob.Y, 2))
		if distance <= t.Range {
			// mob is in range of tower, fire at mob
			t.Cooldown += t.FireRate
			bulletID := getID()
			// create bullet
			return []*Bullet{{ID: bulletID, X: t.X, Y: t.Y, Target: mobs[j],
				Damage: t.Damage, Speed: t.BulletSpeed, TargetID: mobs[j].ID, SplashRadius: t.SplashRadius, SplashDmg: t.SplashDmg, Effect: t.Effect}}
		}
	}
	return []*Bullet{}
}
