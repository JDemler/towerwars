package game

func (g *Config) Player(id int) *Player {
	return &Player{
		ID:     id,
		Money:  g.StartStats.Money,
		Income: g.StartStats.Income,
		Lives:  g.StartStats.Lives,
	}
}

func standardTWMap() *MapConfig {
	return &MapConfig{
		Width:  10,
		Height: 10,
		StartX: 0,
		StartY: 0,
		EndX:   9,
		EndY:   9,
	}
}

var TestGameConfig = Config{
	TowerTypes: []*TowerType{
		{Name: "FastBullet", Levels: []*TowerLevel{{Level: 1, Damage: 1, Range: 300, FireRate: 1, Cost: 5, BulletSpeed: 150}}},
		{Name: "SlowBullet", Levels: []*TowerLevel{
			{Level: 1, Damage: 5, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 25},
			{Level: 2, Damage: 10, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 25},
			{Level: 3, Damage: 15, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 25}}},
		{Name: "StationaryBullet", Levels: []*TowerLevel{{Level: 1, Damage: 5, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 0}}},
	},
	MobTypes: []*MobType{
		{Name: "FastMob", Health: 50, Speed: 70, Reward: 1, Income: 1, Cost: 5},
		{Name: "SlowMob", Health: 100, Speed: 50, Reward: 2, Income: 2, Cost: 10},
		{Name: "StationaryMob", Health: 100, Speed: 0, Reward: 2, Income: 2, Cost: 10},
	},
	Map: standardTWMap(),
	StartStats: &Player{
		Money:  10000,
		Income: 10,
		Lives:  50,
	},
}
