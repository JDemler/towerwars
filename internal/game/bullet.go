package game

import (
	"math"
)

// Bullet represents a bullet
type Bullet struct {
	ID           int     `json:"id"`
	X            float64 `json:"x"`
	Y            float64 `json:"y"`
	Speed        float64 `json:"speed"`
	Damage       float64 `json:"damage"`
	SplashRadius float64 `json:"splash"`
	SplashDmg    float64 `json:"splashDmg"`
	Effect       *Effect `json:"-"`
	Irrelevant   bool    `json:"-"`
	Target       *Mob    `json:"-"`
	TargetID     int     `json:"targetId"`
}

// Implement Crud interface
func (bullet *Bullet) getID() int {
	return bullet.ID
}

// Implement Crud interface
func (bullet *Bullet) getType() string {
	return "bullet"
}

// update bullet returning if it is still relevant to the game
func (bullet *Bullet) update(delta float64, field *Field) bool {
	if bullet.Target == nil || bullet.Target.Health <= 0 {
		// remove bullet from game
		bullet.Irrelevant = true
		return false
	}
	// update bullet position
	// Calc differences in Target and Bullet position
	dx := bullet.Target.X - bullet.X
	dy := bullet.Target.Y - bullet.Y
	// Calc distance between Target and Bullet position
	dist := math.Sqrt(dx*dx + dy*dy)
	// If distance is smaller than speed, bullet hits
	if dist < (bullet.Speed * delta) {
		bullet.X = bullet.Target.X
		bullet.Y = bullet.Target.Y
		bullet.Target.Health -= float64(bullet.Damage)
		bullet.Irrelevant = true
		// splash damage
		if bullet.SplashRadius > 0 {
			field.applySplashDamage(bullet)
		}
		if bullet.Effect != nil {
			field.applyEffect(bullet)
		}
		return false
	}
	// update bullet position
	bullet.X += (bullet.Speed * delta) * dx / dist
	bullet.Y += (bullet.Speed * delta) * dy / dist
	return true
}
