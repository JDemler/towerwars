package game

type GameConfig struct {
	TowerTypes []TowerType
	MobTypes   []MobType
}

type TowerType struct {
	Name        string
	Damage      int
	Range       float64
	FireRate    float64
	BulletSpeed float64
	Cost        int
}

func (t *TowerType) Tower(x float64, y float64) *Tower {
	return &Tower{X: x, Y: y, Damage: t.Damage, Range: t.Range, FireRate: t.FireRate, BulletSpeed: t.BulletSpeed}
}

type MobType struct {
	Name   string
	Health int
	Speed  float64
	Reward int
	Income int
	Cost   int
}

// Make Mob from MobType
func (m *MobType) Mob(x float64, y float64) *Mob {
	return &Mob{X: x, Y: y, TargetX: x, TargetY: y, Health: m.Health, MaxHealth: m.Health, Speed: m.Speed, Reward: m.Reward}
}

// Standard game config
var StandardGameConfig = GameConfig{
	TowerTypes: []TowerType{
		{Name: "Arrow", Damage: 1, Range: 300, FireRate: 0.2, Cost: 5, BulletSpeed: 150},
		{Name: "Siege", Damage: 5, Range: 150, FireRate: 0.7, Cost: 15, BulletSpeed: 75},
	},
	MobTypes: []MobType{
		{Name: "Dot", Health: 50, Speed: 50, Reward: 1, Income: 1, Cost: 5},
		{Name: "Circle", Health: 100, Speed: 60, Reward: 2, Income: 2, Cost: 10},
	},
}

// Lookup function for TowerType
func (g *GameConfig) TowerType(name string) *TowerType {
	for _, t := range g.TowerTypes {
		if t.Name == name {
			return &t
		}
	}
	return nil
}

// Lookup function for MobType
func (g *GameConfig) MobType(name string) *MobType {
	for _, t := range g.MobTypes {
		if t.Name == name {
			return &t
		}
	}
	return nil
}
