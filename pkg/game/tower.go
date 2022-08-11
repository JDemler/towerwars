package game

import (
	"math"
)

type Tower struct {
	X           float64
	Y           float64
	Damage      int
	Range       float64
	FireRate    float64
	Cooldown    float64
	BulletSpeed float64
}

// update tower
func (tower *Tower) Update(delta float64, mobs []*Mob) []*Bullet {
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
			// create bullet
			return []*Bullet{{X: tower.X, Y: tower.Y, Target: mobs[j], Damage: tower.Damage, Speed: tower.BulletSpeed}}
		}
	}
	return []*Bullet{}
}
