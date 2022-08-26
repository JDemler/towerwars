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
		{Name: "FastBullet", Levels: []*TowerLevel{{Level: 1, Damage: 1, Range: 300, FireRate: 1, Cost: 5, BulletSpeed: 5}}},
		{Name: "SlowBullet", Levels: []*TowerLevel{
			{Level: 1, Damage: 5, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 0.8},
			{Level: 2, Damage: 10, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 0.8},
			{Level: 3, Damage: 15, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 0.8}}},
		{Name: "StationaryBullet", Levels: []*TowerLevel{{Level: 1, Damage: 5, Range: 150, FireRate: 1, Cost: 15, BulletSpeed: 0}}},
	},
	MobTypes: []*MobType{
		{Name: "FastMob", Health: 50, Speed: 2, Reward: 1, Income: 1, Cost: 5, Delay: 0, Respawn: 0.1},
		{Name: "SlowMob", Health: 100, Speed: 1, Reward: 2, Income: 2, Cost: 10, Delay: 0, Respawn: 0.1},
		{Name: "StationaryMob", Health: 100, Speed: 0, Reward: 2, Income: 2, Cost: 10, Delay: 0, Respawn: 0.1},
	},
	Map: standardTWMap(),
	StartStats: &Player{
		Money:  10000,
		Income: 10,
		Lives:  50,
	},
}