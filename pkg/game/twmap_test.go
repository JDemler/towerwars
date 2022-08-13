package game

import (
	"testing"
)

// simple map for testing
func simpleTWMap() *TWMap {
	return &TWMap{
		XStart: 0,
		YStart: 0,
		XEnd:   2,
		YEnd:   2,
		Width:  3,
		Height: 3,
		Tiles:  makeTiles(3, 3),
	}
}

// Test that tile is occupied after being occupied
func TestTileIsOccupied(t *testing.T) {
	simpleMap := simpleTWMap()
	// Check that originally tile is not occupied
	if simpleMap.IsOccupied(1, 1) {
		t.Error("Tile should not be occupied")
	}
	// Occupy tile
	simpleMap.Occupy(1, 1)
	// Check that tile is now occupied
	if !simpleMap.IsOccupied(1, 1) {
		t.Error("Tile should be occupied")
	}
}

// Test that tile is perceived as occupied when after it would be occupied there is no path from start to end
func TestTileIsPerceivedAsOccupied(t *testing.T) {
	simpleMap := simpleTWMap()
	// Make sure that 1,1 is not occupied
	if simpleMap.IsOccupied(1, 1) {
		t.Error("Tile should not be occupied")
	}
	// Occupy tiles 1,0 and 1,2
	simpleMap.Occupy(1, 0)
	simpleMap.Occupy(1, 2)
	// Check that tile is perceived as occupied
	if !simpleMap.IsOccupied(1, 1) {
		t.Error("Tile should be perceived as occupied because it is the only path from start to end")
	}
}

// Test that currentpath is calculated correctly
func TestCurrentPath(t *testing.T) {
	simpleMap := simpleTWMap()
	simpleMap.calculatePath()
	// Check that current path is correct
	if len(simpleMap.currentPath) != 3 {
		t.Errorf("Current path should be length 3, but is length %d", len(simpleMap.currentPath))
	}
	if simpleMap.currentPath[0].x != 0 || simpleMap.currentPath[0].y != 0 {
		t.Error("First tile in current path should be 0,0")
	}
	if simpleMap.currentPath[1].x != 1 || simpleMap.currentPath[1].y != 1 {
		t.Error("Second tile in current path should be 1,1")
	}
	if simpleMap.currentPath[2].x != 2 || simpleMap.currentPath[2].y != 2 {
		t.Error("Third tile in current path should be 2,2")
	}
}
