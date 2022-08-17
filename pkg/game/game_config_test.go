package game

func (g *GameConfig) Player(id int) *Player {
	return &Player{
		Id:     id,
		Money:  g.StartStats.Money,
		Income: g.StartStats.Income,
		Lives:  g.StartStats.Lives,
	}
}
