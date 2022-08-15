package game

type Tile struct {
	X        int     `json:"x"`
	Y        int     `json:"y"`
	occupied bool    `json:"-"`
	f        float64 `json:"-"`
	// Only necessary for the a* algorithm
	predecessor *Tile `json:"-"`
}

type tileList []*Tile

// implement sort interface for Tile
func (t tileList) Len() int {
	//return length of t
	return len(t)
}

func (t tileList) Less(i, j int) bool {
	return t[i].f < t[j].f
}

func (t tileList) Swap(i, j int) {
	t[i], t[j] = t[j], t[i]
}

func (t tileList) Contains(tile *Tile) bool {
	for _, t := range t {
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
			t.predecessor = tile.predecessor
			return tl
		}
	}
	return append(tl, tile)
}

func (t tileList) fValueOf(tile *Tile) float64 {
	for _, t := range t {
		if t.X == tile.X && t.Y == tile.Y {
			return t.f
		}
	}
	return 0
}

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
