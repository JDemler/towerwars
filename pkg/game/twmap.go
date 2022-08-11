package game

import (
	"math"
)

type TWMap struct {
	Width  int
	Height int
	XStart int
	YStart int
	XEnd   int
	YEnd   int
	Tiles  [][]Tile
}

func (twMap *TWMap) GetNeighbors(tile Tile) []Tile {
	var neighbors []Tile
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

func (twMap *TWMap) IsEndNode(tile Tile) bool {
	return tile.X == twMap.XEnd && tile.Y == twMap.YEnd
}

func (twMap *TWMap) DistanceToEnd(tile Tile) float64 {
	return float64(math.Abs(float64(tile.X-twMap.XEnd)) + math.Abs(float64(tile.Y-twMap.YEnd)))
}

func (twMap *TWMap) IsOccupied(x, y int) bool {
	return twMap.Tiles[x][y].IsOccupied()
}

func (twMap *TWMap) Occupy(x, y int) {
	twMap.Tiles[x][y].occupied = true
}

func (twMap *TWMap) StartPosition() (int, int) {
	return twMap.XStart, twMap.YStart
}

func standardTWMap() TWMap {
	return TWMap{
		Width:  10,
		Height: 10,
		XStart: 0,
		YStart: 0,
		XEnd:   3,
		YEnd:   9,
		Tiles:  makeTiles(10, 10),
	}
}

// make a 2d range of tiles
func makeTiles(width, height int) [][]Tile {
	tiles := make([][]Tile, width)
	for i := 0; i < width; i++ {
		for j := 0; j < height; j++ {
			tiles[i] = append(tiles[i], Tile{X: i, Y: j})
		}
	}
	return tiles
}
