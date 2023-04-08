package game

import (
	"testing"
)

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
	SocialNetworks: []*SocialNetworkConfig{
		{Name: "StandardRace",
			Key:         "sr",
			Description: "-",
			TowerTypes: []*TowerType{
				{Name: "FastBullet", Key: "FastBullet", Levels: []*TowerLevel{{Level: 1, Damage: 1, Range: 15, FireRate: 1, Cost: 5, BulletSpeed: 5}}},
				{Name: "SlowBullet", Key: "SlowBullet", Levels: []*TowerLevel{
					{Level: 1, Damage: 5, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0.8},
					{Level: 2, Damage: 10, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0.8},
					{Level: 3, Damage: 15, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0.8}}},
				{Name: "StationaryBullet", Key: "StationaryBullet", Levels: []*TowerLevel{{Level: 1, Damage: 5, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 0}}},
				{Name: "SplashBullet", Key: "SplashBullet", Levels: []*TowerLevel{{Level: 1, Damage: 10, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 2, SplashRadius: 1, SplashDmg: 0.5}}},
				{Name: "StunBullet", Key: "StunBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: stunEffect}}},
				{Name: "SlowingBullet", Key: "SlowingBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 5, Effect: slowEffect}}},
				{Name: "PoisonBullet", Key: "PoisonBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 1, Cost: 15, BulletSpeed: 5, Effect: poisonEffect}}},
				{Name: "SplashStunBullet", Key: "SplashStunBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: stunEffect, SplashRadius: 1}}},
				{Name: "SplashSlowingBullet", Key: "SplashSlowingBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: slowEffect, SplashRadius: 1}}},
				{Name: "SplashPoisonBullet", Key: "SplashPoisonBullet", Levels: []*TowerLevel{{Level: 1, Damage: 0, Range: 15, FireRate: 0.9, Cost: 15, BulletSpeed: 5, Effect: poisonEffect, SplashRadius: 1}}},
			},
			MobTypes: []*MobType{
				{Name: "FastMob", Key: "FastMob", Health: 50, Speed: 2, Reward: 1, Income: 1, Cost: 5, Delay: 0, Respawn: 0.1, MaxStock: 1000},
				{Name: "SlowMob", Key: "SlowMob", Health: 100, Speed: 1, Reward: 2, Income: 2, Cost: 10, Delay: 0, Respawn: 0.1, MaxStock: 1000},
				{Name: "StationaryMob", Key: "StationaryMob", Health: 100, Speed: 0, Reward: 2, Income: 2, Cost: 10, Delay: 0, Respawn: 0.1, MaxStock: 1000},
			},
		},
	},
	MobLevelUpConfig: &UpgradeMobTypeConfig{
		UpgradeCostFactor: 10,
		HealthFactor:      10,
		SpeedFactor:       1,
		RewardFactor:      10,
		IncomeFactor:      10,
		CostFactor:        10,
		RespawnFactor:     1,
		DelayFactor:       1,
	},
	Map: standardTWMap(),
	StartStats: &Player{
		Money:  100,
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

func TestReadSocialNetworkConfigFromFile(t *testing.T) {
	// Test reading YAML config file
	config, err := ReadSocialNetworkConfigFromFile("../../cmd/server/networkconfigs/facebook.yaml")

	// check that there are no errors
	if err != nil {
		t.Errorf("Expected no errors, got %v", err)
	}

	// check that network description is not empty
	if config.Description == "" {
		t.Errorf("Expected non-empty description, got %s", config.Description)
	}

	// check that there are more than 0 mob types in config
	if len(config.MobTypes) == 0 {
		t.Errorf("Expected more than 0 mob types, got %d", len(config.MobTypes))
	}

	// check that there are more than 0 tower types in config
	if len(config.TowerTypes) == 0 {
		t.Errorf("Expected more than 0 tower types, got %d", len(config.TowerTypes))
	}
}
