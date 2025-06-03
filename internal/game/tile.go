package game

import "math"

// Tile represents a tile on the map. Can be occupied. f and predecessor are used for pathfinding
type Tile struct {
	X           int     `json:"x"`
	Y           int     `json:"y"`
	occupied    bool    `json:"-"`
	f           float64 `json:"-"`
	g           float64 `json:"-"`
	predecessor *Tile   `json:"-"`
}

type tileList []*Tile

// implement sort interface for Tile
func (tl tileList) Len() int {
	//return length of t
	return len(tl)
}

// Less returns true if the f value of the tile is smaller than the f value of the other tile
func (tl tileList) Less(i, j int) bool {
	return tl[i].f < tl[j].f
}

// Swap two tiles with each other
func (tl tileList) Swap(i, j int) {
	tl[i], tl[j] = tl[j], tl[i]
}

// Contains returns true if the tile is in the list
func (tl tileList) Contains(tile *Tile) bool {
	for _, t := range tl {
		if t.X == tile.X && t.Y == tile.Y {
			return true
		}
	}
	return false
}

func (tl tileList) add(tile *Tile) tileList {
	for _, t := range tl {
		if t.X == tile.X && t.Y == tile.Y {
			t.f = tile.f
			t.g = tile.g
			t.predecessor = tile.predecessor
			return tl
		}
	}
	return append(tl, tile)
}

func (tl tileList) fValueOf(tile *Tile) float64 {
	for _, t := range tl {
		if t.X == tile.X && t.Y == tile.Y {
			return t.f
		}
	}
	return 0
}

func (tl tileList) gValueOf(tile *Tile) float64 {
	for _, t := range tl {
		if t.X == tile.X && t.Y == tile.Y {
			return t.g
		}
	}
	return math.Inf(1)
}

// IsOccupied returns true if the tile is occupied
func (tile *Tile) IsOccupied() bool {
	return tile.occupied
}

func (tile *Tile) path(acc []position) []position {
	if tile != nil {
		// prepend own position to acc
		acc = append([]position{{tile.X, tile.Y}}, acc...)
		// call recursive function on predecessor if it exists
		if tile.predecessor != nil {
			return tile.predecessor.path(acc)
		}
	}
	return acc
}
