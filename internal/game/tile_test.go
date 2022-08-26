package game

import (
	"testing"
)

func TestLen(t *testing.T) {
	tiles := makeTiles(2, 2)
	if len(tiles) != 2 {
		t.Errorf("Expected 2 tiles, got %d", len(tiles))
	}
}
