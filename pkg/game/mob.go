package game

import (
	"errors"
	"fmt"
	"math"
	"sort"
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
	path, err := mob.findPath(twMap)
	if err == nil {
		nextTile := path.NextTile()
		if nextTile != nil {
			//log mob reached end of map
			mob.TargetX = float64(nextTile.X)*TileSize + TileSize/2
			mob.TargetY = float64(nextTile.Y)*TileSize + TileSize/2
		} else {
			//Mob reach maps end. Kill it
			fmt.Println("Mob reached end of map")
			mob.Reached = true
		}
	}
}

func (mob *Mob) findPath(twMap *TWMap) (Tile, error) {
	//use a* search algorithm to find path for mob
	mobX := int(mob.X / TileSize)
	mobY := int(mob.Y / TileSize)
	openTiles := tileList([]Tile{{X: mobX, Y: mobY}})
	closedTiles := tileList([]Tile{})

	for openTiles.Len() > 0 {
		sort.Sort(openTiles)
		currentTile := openTiles[0]
		openTiles = openTiles[1:]
		if twMap.IsEndNode(currentTile) {
			return currentTile, nil
		}
		closedTiles = append(closedTiles, currentTile)
		for _, neighbor := range twMap.GetNeighbors(currentTile) {
			if closedTiles.Contains(neighbor) || neighbor.IsOccupied() {
				continue
			}
			g := currentTile.f + 1
			if openTiles.fValueOf(neighbor) >= g {
				continue
			}
			neighbor.f = g + twMap.DistanceToEnd(neighbor)
			neighbor.predecessor = &currentTile

			openTiles = openTiles.add(neighbor)
		}
	}
	return Tile{}, errors.New("No path found")
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
