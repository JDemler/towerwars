package game

type MapConstructor func() *TWMap

type GameConfig struct {
	TowerTypes []*TowerType
	MobTypes   []*MobType
	TWMap      MapConstructor
}

type TowerType struct {
	Name        string  `json:"name"`
	Damage      int     `json:"damage"`
	Range       float64 `json:"range"`
	FireRate    float64 `json:"fire_rate"`
	BulletSpeed float64 `json:"bullet_speed"`
	Cost        int     `json:"cost"`
}

func (t *TowerType) Tower(x float64, y float64) *Tower {
	return &Tower{X: x, Y: y, Damage: t.Damage, Range: t.Range, FireRate: t.FireRate, BulletSpeed: t.BulletSpeed, Cooldown: 0}
}

type MobType struct {
	Name   string  `json:"name"`
	Health int     `json:"health"`
	Speed  float64 `json:"speed"`
	Reward int     `json:"reward"`
	Income int     `json:"income"`
	Cost   int     `json:"cost"`
}

// Make Mob from MobType
func (m *MobType) Mob(x float64, y float64, id int) *Mob {
	return &Mob{Id: id, X: x, Y: y, TargetX: x, TargetY: y, Health: m.Health, MaxHealth: m.Health, Speed: m.Speed, Reward: m.Reward, Type: m.Name}
}

// Standard game config
var StandardGameConfig = GameConfig{
	TowerTypes: []*TowerType{
		{Name: "Arrow", Damage: 1, Range: 300, FireRate: 0.2, Cost: 5, BulletSpeed: 150},
		{Name: "Siege", Damage: 5, Range: 150, FireRate: 0.7, Cost: 15, BulletSpeed: 75},
	},
	MobTypes: []*MobType{
		{Name: "Dot", Health: 50, Speed: 50, Reward: 1, Income: 1, Cost: 5},
		{Name: "Circle", Health: 100, Speed: 60, Reward: 2, Income: 2, Cost: 10},
	},
	TWMap: standardTWMap,
}

var TestGameConfig = GameConfig{
	TowerTypes: []*TowerType{
		{Name: "FastBullet", Damage: 1, Range: 300, FireRate: 1, Cost: 5, BulletSpeed: 150},
		{Name: "SlowBullet", Damage: 5, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 25},
		{Name: "StationaryBullet", Damage: 5, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 0},
	},
	MobTypes: []*MobType{
		{Name: "FastMob", Health: 50, Speed: 70, Reward: 1, Income: 1, Cost: 5},
		{Name: "SlowMob", Health: 100, Speed: 50, Reward: 2, Income: 2, Cost: 10},
		{Name: "StationaryMob", Health: 100, Speed: 0, Reward: 2, Income: 2, Cost: 10},
	},
}

// Lookup function for TowerType
func (g *GameConfig) TowerType(name string) *TowerType {
	for _, t := range g.TowerTypes {
		if t.Name == name {
			return t
		}
	}
	return nil
}

// Lookup function for MobType
func (g *GameConfig) MobType(name string) *MobType {
	for _, t := range g.MobTypes {
		if t.Name == name {
			return t
		}
	}
	return nil
}
