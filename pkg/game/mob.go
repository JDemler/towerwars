package game

import (
	"fmt"
	"math"
)

type Mob struct {
	X         float64
	Y         float64
	Speed     float64
	TargetX   float64
	TargetY   float64
	Health    int
	MaxHealth int
	Reward    int
	Reached   bool
}

func (mob *Mob) calcDirection(twMap *TWMap) {
	x, y := int(mob.X/TileSize), int(mob.Y/TileSize)
	if twMap.IsEnd(x, y) {
		mob.Reached = true
		return
	}
	nX, nY, err := twMap.NextStep(int(mob.X/TileSize), int(mob.Y/TileSize))
	if err != nil {
		fmt.Println(err)
	}
	mob.TargetX = float64(nX)*TileSize + TileSize/2
	mob.TargetY = float64(nY)*TileSize + TileSize/2
}

func (mob *Mob) IsDead() bool {
	return mob.Health <= 0 || mob.Reached
}

func (mob *Mob) Update(delta float64, twMap *TWMap) {
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
	}
}
