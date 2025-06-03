package game

import (
	"errors"
	"math"
	"sort"
)

type position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// TWMap is a map for the tower defense game
type TWMap struct {
	Width       int       `json:"width"`
	Height      int       `json:"height"`
	XStart      int       `json:"xstart"`
	YStart      int       `json:"ystart"`
	XEnd        int       `json:"xend"`
	YEnd        int       `json:"yend"`
	Tiles       [][]*Tile `json:"tiles"`
	CurrentPath Path      `json:"currentPath"`
}

// make currentPath its own type
type Path []position

// Implement Crud interface
func (p *Path) getID() int {
	return 0
}

// Implement Crud interface
func (p *Path) getType() string {
	return "path"
}

// IsInBounds checks if x,y is in the bounds of the map
func (twMap *TWMap) IsInBounds(x, y int) bool {
	return x >= 0 && x < twMap.Width && y >= 0 && y < twMap.Height
}

func (twMap *TWMap) getNeighbors(tile *Tile) []*Tile {
	var neighbors []*Tile
	// go over left, right, up and down and add the neighbors
	if twMap.IsInBounds(tile.X-1, tile.Y) {
		neighbors = append(neighbors, twMap.getAt(tile.X-1, tile.Y))
	}
	if twMap.IsInBounds(tile.X+1, tile.Y) {
		neighbors = append(neighbors, twMap.getAt(tile.X+1, tile.Y))
	}
	if twMap.IsInBounds(tile.X, tile.Y-1) {
		neighbors = append(neighbors, twMap.getAt(tile.X, tile.Y-1))
	}
	if twMap.IsInBounds(tile.X, tile.Y+1) {
		neighbors = append(neighbors, twMap.getAt(tile.X, tile.Y+1))
	}
	return neighbors
}

func (twMap *TWMap) isEndNode(tile *Tile) bool {
	return twMap.isEnd(tile.X, tile.Y)
}

func (twMap *TWMap) isEnd(x, y int) bool {
	return x == twMap.XEnd && y == twMap.YEnd
}

func (twMap *TWMap) isStart(x, y int) bool {
	return x == twMap.XStart && y == twMap.YStart
}

func (twMap *TWMap) distanceToEnd(tile *Tile) float64 {
	return float64(math.Abs(float64(tile.X-twMap.XEnd)) + math.Abs(float64(tile.Y-twMap.YEnd)))
}

func (twMap *TWMap) isOccupied(x, y int) bool {
	// Check if x,y is EndTile
	if twMap.isEnd(x, y) {
		return true
	}
	// check if x,y is StartTile
	if twMap.isStart(x, y) {
		return true
	}
	if twMap.Tiles[x][y].IsOccupied() {
		return true
	}
	//Check if x and y is on the current path
	for i := 0; i < len(twMap.CurrentPath); i++ {
		if twMap.CurrentPath[i].X == x && twMap.CurrentPath[i].Y == y {
			// occupy the tile
			twMap.occupy(x, y)
			pathExists := len(twMap.CurrentPath) > 0
			twMap.free(x, y)
			return !pathExists
		}
	}
	return false
}

func (twMap *TWMap) occupy(x, y int) Path {
	twMap.Tiles[x][y].occupied = true
	//recalculate current path
	twMap.calculatePath()
	return twMap.CurrentPath
}

func (twMap *TWMap) free(x, y int) Path {
	twMap.Tiles[x][y].occupied = false
	twMap.calculatePath()
	return twMap.CurrentPath
}

func (twMap *TWMap) startPosition() (int, int) {
	return twMap.XStart, twMap.YStart
}

// get tile at x, y position
func (twMap *TWMap) getAt(x int, y int) *Tile {
	return twMap.Tiles[x][y]
}

func (twMap *TWMap) nextStep(x int, y int) (int, int, error) {
	if len(twMap.CurrentPath) == 0 {
		twMap.calculatePath()
	}
	//Find current step in current path
	for i := 0; i < len(twMap.CurrentPath)-1; i++ {
		if twMap.CurrentPath[i].X == x && twMap.CurrentPath[i].Y == y {
			return twMap.CurrentPath[i+1].X, twMap.CurrentPath[i+1].Y, nil
		}
	}
	// current x,y is not on the path, must be off, probably because towers were placed or removed
	// Calculate path especially for this x,y
	path, err := twMap.findPath(x, y)
	if err != nil {
		return 0, 0, err
	}
	pathPositions := path.path([]position{})
	for i := 0; i < len(pathPositions)-1; i++ {
		if pathPositions[i].X == x && pathPositions[i].Y == y {
			return pathPositions[i+1].X, pathPositions[i+1].Y, nil
		}
	}
	return 0, 0, errors.New("No next step")
}

func (twMap *TWMap) calculatePath() {
	path, err := twMap.findPath(twMap.XStart, twMap.YStart)
	if err != nil {
		twMap.CurrentPath = nil
		return
	}
	twMap.CurrentPath = path.path([]position{})
}

func (twMap *TWMap) findPath(x int, y int) (*Tile, error) {
	startTile := twMap.getAt(x, y)
	startTile.predecessor = nil
	startTile.g = 0
	startTile.f = twMap.distanceToEnd(startTile)
	openTiles := tileList([]*Tile{startTile})
	closedTiles := tileList([]*Tile{})

	for openTiles.Len() > 0 {
		sort.Sort(openTiles)
		currentTile := openTiles[0]
		openTiles = openTiles[1:]
		if twMap.isEndNode(currentTile) {
			return currentTile, nil
		}
		closedTiles = append(closedTiles, currentTile)
		for _, neighbor := range twMap.getNeighbors(currentTile) {
			if closedTiles.Contains(neighbor) || neighbor.IsOccupied() {
				continue
			}
			g := currentTile.g + 1
			if openTiles.gValueOf(neighbor) <= g {
				continue
			}
			neighbor.g = g
			neighbor.f = g + twMap.distanceToEnd(neighbor)
			neighbor.predecessor = currentTile

			openTiles = openTiles.add(neighbor)
		}
	}
	return &Tile{}, errors.New("No path found")
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
