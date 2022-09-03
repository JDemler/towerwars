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
		{Name: "FastBullet", Key: "FastBullet", Levels: []*TowerLevel{{Level: 1, Damage: 1, Range: 15, FireRate: 1, Cost: 5, BulletSpeed: 5}}},
		{Name: "SlowBullet", Key: "SlowBullet", Levels: []*TowerLevel{
			{Level: 1, Damage: 5, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0.8},
			{Level: 2, Damage: 10, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0.8},
			{Level: 3, Damage: 15, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0.8}}},
		{Name: "StationaryBullet", Key: "StationaryBullet", Levels: []*TowerLevel{{Level: 1, Damage: 5, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0}}},
		{Name: "SplashBullet", Key: "SplashBullet", Levels: []*TowerLevel{{Level: 1, Damage: 10, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 2, SplashRange: 1, SplashDmg: 0.5}}},
		{Name: "StunBullet", Key: "StunBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: stunEffect}}},
		{Name: "SlowingBullet", Key: "SlowingBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 5, Effect: slowEffect}}},
		{Name: "PoisonBullet", Key: "PoisonBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 5, Effect: poisonEffect}}},
		{Name: "SplashStunBullet", Key: "SplashStunBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: stunEffect, SplashRange: 1}}},
		{Name: "SplashSlowingBullet", Key: "SplashSlowingBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: slowEffect, SplashRange: 1}}},
		{Name: "SplashPoisonBullet", Key: "SplashPoisonBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: poisonEffect, SplashRange: 1}}},
	},
	MobTypes: []*MobType{
		{Name: "FastMob", Key: "FastMob", Health: 50, Speed: 2, Reward: 1, Income: 1, Cost: 5, Delay: 0, Respawn: 0.1},
		{Name: "SlowMob", Key: "SlowMob", Health: 100, Speed: 1, Reward: 2, Income: 2, Cost: 10, Delay: 0, Respawn: 0.1},
		{Name: "StationaryMob", Key: "StationaryMob", Health: 100, Speed: 0, Reward: 2, Income: 2, Cost: 10, Delay: 0, Respawn: 0.1},
	},
	Map: standardTWMap(),
	StartStats: &Player{
		Money:  10000,
		Income: 10,
		Lives:  50,
	},
}

var stunEffect = &Effect{
	Type: "stun", Value: 1, Duration: 1,
}

var slowEffect = &Effect{
	Type: "slow", Value: 0.99, Duration: 1,
}

var poisonEffect = &Effect{
	Type: "dot", Value: 1, Duration: 1,
}
