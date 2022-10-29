package game

// Player represents a player in the game
type Player struct {
	ID       int     `json:"id"`
	Name     string  `json:"name"`
	Money    float64 `json:"money"`
	Income   float64 `json:"income"`
	Lives    int     `json:"lives"`
	Latency  int64   `json:"latency"`
	LastPing int64   `json:"lastPing"`
}

// Implement Crud interface for Player
func (p *Player) getID() int {
	return p.ID
}

func (p *Player) getType() string {
	return "player"
}
