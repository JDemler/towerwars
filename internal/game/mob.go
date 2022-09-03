package game

import (
	"fmt"
	"math"
)

// Mob represents a mob in the game
type Mob struct {
	ID              int      `json:"id"`
	X               float64  `json:"x"`
	Y               float64  `json:"y"`
	Speed           float64  `json:"speed"`
	TargetX         float64  `json:"targetX"`
	TargetY         float64  `json:"targetY"`
	Health          float64  `json:"health"`
	MaxHealth       int      `json:"maxHealth"`
	Reward          int      `json:"reward"`
	Effects         []Effect `json:"effects"`
	SentFromFieldID int      `json:"-"`
	Reached         bool     `json:"-"`
	Type            string   `json:"type"`
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
	// check effects
	stun, slow, dot := m.updateEffects(delta)
	if stun {
		return []*ServerEvent{updateEvent(m, fieldID)}
	}
	changed := false
	if dot > 0 {
		// Apply dot damage
		m.Health -= dot * delta
		changed = true
	}
	// Calc differences in Target vs Position
	dx := m.TargetX - m.X
	dy := m.TargetY - m.Y
	totalDiff := math.Sqrt(dx*dx + dy*dy)
	// If mob is close enough to target, move to target
	if totalDiff <= (m.Speed * delta * (1 - slow)) {
		m.X = m.TargetX
		m.Y = m.TargetY
	} else {
		// From differences, calculate direction to move
		directionX := dx / totalDiff
		directionY := dy / totalDiff
		// Move mob in direction
		m.X += directionX * m.Speed * delta * (1 - slow)
		m.Y += directionY * m.Speed * delta * (1 - slow)
	}
	if m.X == m.TargetX && m.Y == m.TargetY {
		m.calcDirection(twMap)
		changed = true
	}
	if changed {
		return []*ServerEvent{updateEvent(m, fieldID)}
	}
	return []*ServerEvent{}
}

func (m *Mob) updateEffects(delta float64) (bool, float64, float64) /*stun slow dot*/ {
	var stun = false
	var slow, dot = 0.0, 0.0

	//Reverse for loop over effects. Remove when duration is 0
	for i := len(m.Effects) - 1; i >= 0; i-- {
		if m.Effects[i].Type == "stun" {
			stun = true
		}
		if m.Effects[i].Type == "slow" {
			slow += m.Effects[i].Value
		}
		if m.Effects[i].Type == "dot" {
			dot += m.Effects[i].Value
		}
		m.Effects[i].Duration -= delta
		if m.Effects[i].Duration <= 0 {
			m.Effects = append(m.Effects[:i], m.Effects[i+1:]...)
		}
	}
	return stun, slow, dot
}

// Apply effect to mob. They do not stack. Effects of same type take the max duration
func (m *Mob) applyEffect(effect Effect) {
	for i := range m.Effects {
		if m.Effects[i].Type == effect.Type {
			if m.Effects[i].Duration < effect.Duration {
				m.Effects[i].Duration = effect.Duration
			}
			return
		}
	}
	m.Effects = append(m.Effects, effect)
}
