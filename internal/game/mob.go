package game

import (
	"fmt"
	"math"
)

// Mob represents a mob in the game
type Mob struct {
	ID              int     `json:"id"`
	X               float64 `json:"x"`
	Y               float64 `json:"y"`
	Speed           float64 `json:"speed"`
	TargetX         float64 `json:"targetX"`
	TargetY         float64 `json:"targetY"`
	Health          int     `json:"health"`
	MaxHealth       int     `json:"maxHealth"`
	Reward          int     `json:"reward"`
	SentFromFieldID int     `json:"-"`
	Reached         bool    `json:"-"`
	Type            string  `json:"type"`
}

// Implement Crud interface
func (m *Mob) getID() int {
	return m.ID
}

// Implement Crud interface
func (m *Mob) getType() string {
	return "mob"
}

func (m *Mob) calcDirection(twMap *TWMap) {
	x, y := int(m.X), int(m.Y)
	if twMap.isEnd(x, y) {
		m.Reached = true
		return
	}
	nX, nY, err := twMap.nextStep(int(m.X), int(m.Y))
	if err != nil {
		fmt.Println(err)
	}
	m.TargetX = float64(nX) + 0.5
	m.TargetY = float64(nY) + 0.5
}

// isDead returns true if mob is dead or reached the end of the map
func (m *Mob) isDead() bool {
	return m.Health <= 0 || m.Reached
}

// update Mob potentially returning mobUpdated event
func (m *Mob) update(delta float64, twMap *TWMap, fieldID int) []*ServerEvent {
	// Calc differences in Target vs Position
	dx := m.TargetX - m.X
	dy := m.TargetY - m.Y
	totalDiff := math.Sqrt(dx*dx + dy*dy)
	// If mob is close enough to target, move to target
	if totalDiff <= (m.Speed * delta) {
		m.X = m.TargetX
		m.Y = m.TargetY
	} else {
		// From differences, calculate direction to move
		directionX := dx / totalDiff
		directionY := dy / totalDiff
		// Move mob in direction
		m.X += directionX * m.Speed * delta
		m.Y += directionY * m.Speed * delta
	}
	if m.X == m.TargetX && m.Y == m.TargetY {
		m.calcDirection(twMap)
		return []*ServerEvent{updateEvent(m, fieldID)}
	}
	return []*ServerEvent{}
}
