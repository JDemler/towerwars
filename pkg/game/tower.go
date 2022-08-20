package game

import (
	"math"
)

type Tower struct {
	Id          int     `json:"id"`
	X           float64 `json:"x"`
	Y           float64 `json:"y"`
	Damage      int     `json:"damage"`
	Range       float64 `json:"range"`
	FireRate    float64 `json:"fire_rate"`
	Cooldown    float64 `json:"cooldown"`
	Level       int     `json:"level"`
	Type        string  `json:"type"`
	BulletSpeed float64 `json:"-"`
}

// upgrade tower from towerlevel
func (t *Tower) Upgrade(towerLevel *TowerLevel) {
	t.Damage = towerLevel.Damage
	t.Range = towerLevel.Range
	t.FireRate = towerLevel.FireRate
	t.BulletSpeed = towerLevel.BulletSpeed
	t.Level = towerLevel.Level
}

// update tower
func (tower *Tower) Update(delta float64, mobs []*Mob, getId func() int) []*Bullet {
	tower.Cooldown = math.Max((tower.Cooldown - delta), 0)
	if tower.Cooldown > 0 {
		return []*Bullet{}
	}

	// check if mob is in range of tower
	for j, mob := range mobs {
		//calculate distance to mob
		distance := math.Sqrt(math.Pow(tower.X-mob.X, 2) + math.Pow(tower.Y-mob.Y, 2))
		if distance <= tower.Range {
			// mob is in range of tower, fire at mob
			tower.Cooldown += tower.FireRate
			bulletId := getId()
			// create bullet
			return []*Bullet{{Id: bulletId, X: tower.X, Y: tower.Y, Target: mobs[j], Damage: tower.Damage, Speed: tower.BulletSpeed, TargetId: mobs[j].Id}}
		}
	}
	return []*Bullet{}
}
