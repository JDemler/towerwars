package game

// Player represents a player in the game
type Player struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Money  int    `json:"money"`
	Income int    `json:"income"`
	Lives  int    `json:"lives"`
}

// Implement Crud interface for Player
func (p *Player) getID() int {
	return p.ID
}

func (p *Player) getType() string {
	return "player"
}