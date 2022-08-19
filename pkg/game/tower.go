package game

import (
	"math"
)

type Tower struct {
	X           float64 `json:"x"`
	Y           float64 `json:"y"`
	Damage      int     `json:"damage"`
	Range       float64 `json:"range"`
	FireRate    float64 `json:"fire_rate"`
	Cooldown    float64 `json:"cooldown"`
	BulletSpeed float64 `json:"-"`
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
