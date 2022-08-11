package game

import (
	"testing"
)

func TestMakeTiles(t *testing.T) {
	tiles := makeTiles(2, 2)
	if len(tiles) != 2 {
		t.Errorf("Expected 2 tiles, got %d", len(tiles))
	}
	if len(tiles[0]) != 2 {
		t.Errorf("Expected 2 tiles in row, got %d", len(tiles[0]))
	}
	if tiles[0][0].X != 0 {
		t.Errorf("Expected X to be 0, got %d", tiles[0][0].X)
	}
	if tiles[0][0].Y != 0 {
		t.Errorf("Expected Y to be 0, got %d", tiles[0][0].Y)
	}
	if tiles[1][1].X != 1 {
		t.Errorf("Expected X to be 1, got %d", tiles[1][1].X)
	}
	if tiles[1][1].Y != 1 {
		t.Errorf("Expected Y to be 1, got %d", tiles[1][1].Y)
	}
}
