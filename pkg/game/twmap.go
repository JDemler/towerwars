package game

import (
	"errors"
	"math"
	"sort"
)

type position struct {
	x int
	y int
}

type TWMap struct {
	Width       int        `json:"width"`
	Height      int        `json:"height"`
	XStart      int        `json:"xstart"`
	YStart      int        `json:"ystart"`
	XEnd        int        `json:"xend"`
	YEnd        int        `json:"yend"`
	Tiles       [][]*Tile  `json:"tiles"`
	currentPath []position `json:"-"`
}

func (twMap *TWMap) GetNeighbors(tile *Tile) []*Tile {
	var neighbors []*Tile
	for i := -1; i <= 1; i++ {
		for j := -1; j <= 1; j++ {
			if i == 0 && j == 0 {
				continue
			}
			if tile.X+i >= 0 && tile.X+i < twMap.Width && tile.Y+j >= 0 && tile.Y+j < twMap.Height {
				neighbors = append(neighbors, twMap.Tiles[tile.X+i][tile.Y+j])
			}
		}
	}
	return neighbors
}

func (twMap *TWMap) IsEndNode(tile *Tile) bool {
	return twMap.IsEnd(tile.X, tile.Y)
}

func (twMap *TWMap) IsEnd(x, y int) bool {
	return x == twMap.XEnd && y == twMap.YEnd
}

func (twMap *TWMap) IsStart(x, y int) bool {
	return x == twMap.XStart && y == twMap.YStart
}

func (twMap *TWMap) DistanceToEnd(tile *Tile) float64 {
	return float64(math.Abs(float64(tile.X-twMap.XEnd)) + math.Abs(float64(tile.Y-twMap.YEnd)))
}

func (twMap *TWMap) IsOccupied(x, y int) bool {
	// Check if x,y is EndTile
	if twMap.IsEnd(x, y) {
		return true
	}
	// check if x,y is StartTile
	if twMap.IsStart(x, y) {
		return true
	}
	if twMap.Tiles[x][y].IsOccupied() {
		return true
	}
	//Check if x and y is on the current path
	for i := 0; i < len(twMap.currentPath); i++ {
		if twMap.currentPath[i].x == x && twMap.currentPath[i].y == y {
			// occupy the tile
			twMap.Occupy(x, y)
			pathExists := len(twMap.currentPath) > 0
			twMap.Free(x, y)
			return !pathExists
		}
	}
	return false
}

func (twMap *TWMap) Occupy(x, y int) bool {
	twMap.Tiles[x][y].occupied = true
	//recalculate current path
	twMap.calculatePath()
	return true
}

func (twMap *TWMap) Free(x, y int) bool {
	twMap.Tiles[x][y].occupied = false
	twMap.calculatePath()
	return true
}

func (twMap *TWMap) StartPosition() (int, int) {
	return twMap.XStart, twMap.YStart
}

// get tile at x, y position
func (twMap *TWMap) getAt(x int, y int) *Tile {
	return twMap.Tiles[x][y]
}

func (twMap *TWMap) NextStep(x int, y int) (int, int, error) {
	// use a* search algorithm to find the next step
	twMap.calculatePath()
	//Find current step in current path
	for i := 0; i < len(twMap.currentPath)-1; i++ {
		if twMap.currentPath[i].x == x && twMap.currentPath[i].y == y {
			return twMap.currentPath[i+1].x, twMap.currentPath[i+1].y, nil
		}
	}
	return 0, 0, errors.New("No next step")
}

func (twMap *TWMap) calculatePath() {
	path, err := twMap.findPath(twMap.XStart, twMap.YStart)
	if err != nil {
		twMap.currentPath = nil
		return
	}
	twMap.currentPath = path.path([]position{})
}

func (twMap *TWMap) findPath(x int, y int) (*Tile, error) {
	openTiles := tileList([]*Tile{twMap.getAt(x, y)})
	closedTiles := tileList([]*Tile{})

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
			neighbor.predecessor = currentTile

			openTiles = openTiles.add(neighbor)
		}
	}
	return &Tile{}, errors.New("No path found")
}

func standardTWMap() *TWMap {
	return &TWMap{
		Width:  10,
		Height: 10,
		XStart: 0,
		YStart: 0,
		XEnd:   9,
		YEnd:   9,
		Tiles:  makeTiles(10, 10),
	}
}

// make a 2d range of tiles
func makeTiles(width, height int) [][]*Tile {
	tiles := make([][]*Tile, width)
	for i := 0; i < width; i++ {
		for j := 0; j < height; j++ {
			tiles[i] = append(tiles[i], &Tile{X: i, Y: j})
		}
	}
	return tiles
}
