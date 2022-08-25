package game

import (
	"fmt"
	"math"
)

// Mob represents a mob in the game
type Mob struct {
	ID              int     `json:"id"`
	X               float64 `json:"x"`
	Y               float64 `json:"y"`
	Speed           float64 `json:"speed"`
	TargetX         float64 `json:"targetX"`
	TargetY         float64 `json:"targetY"`
	Health          int     `json:"health"`
	MaxHealth       int     `json:"maxHealth"`
	Reward          int     `json:"reward"`
	SentFromFieldID int     `json:"-"`
	Reached         bool    `json:"-"`
	Type            string  `json:"type"`
}

// Implement Crud interface
func (m *Mob) GetID() int {
	return m.ID
}

// Implement Crud interface
func (m *Mob) GetType() string {
	return "mob"
}

func (mob *Mob) calcDirection(twMap *TWMap) {
	x, y := int(mob.X/TileSize), int(mob.Y/TileSize)
	if twMap.isEnd(x, y) {
		mob.Reached = true
		return
	}
	nX, nY, err := twMap.nextStep(int(mob.X/TileSize), int(mob.Y/TileSize))
	if err != nil {
		fmt.Println(err)
	}
	mob.TargetX = float64(nX)*TileSize + TileSize/2
	mob.TargetY = float64(nY)*TileSize + TileSize/2
}

// IsDead returns true if mob is dead or reached the end of the map
func (mob *Mob) IsDead() bool {
	return mob.Health <= 0 || mob.Reached
}

// Update Mob potentially returning mobUpdated event
func (mob *Mob) Update(delta float64, twMap *TWMap, fieldID int) []*ServerEvent {
	// Calc differences in Target vs Position
	dx := mob.TargetX - mob.X
	dy := mob.TargetY - mob.Y
	totalDiff := math.Sqrt(dx*dx + dy*dy)
	// If mob is close enough to target, move to target
	if totalDiff <= (mob.Speed * delta) {
		mob.X = mob.TargetX
		mob.Y = mob.TargetY
	} else {
		// From differences, calculate direction to move
		directionX := dx / totalDiff
		directionY := dy / totalDiff
		// Move mob in direction
		mob.X += directionX * mob.Speed * delta
		mob.Y += directionY * mob.Speed * delta
	}
	if mob.X == mob.TargetX && mob.Y == mob.TargetY {
		mob.calcDirection(twMap)
		return []*ServerEvent{UpdateEvent(mob, fieldID)}
	}
	return []*ServerEvent{}
}
