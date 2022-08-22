package game

import (
	"encoding/json"
	"fmt"
	"os"
)

type GameConfig struct {
	TowerTypes     []*TowerType `json:"towerTypes"`
	MobTypes       []*MobType   `json:"mobTypes"`
	Map            *MapConfig   `json:"map"`
	StartStats     *Player      `json:"startStats"`
	IncomeCooldown int          `json:"incomeCooldown"`
}

type MapConfig struct {
	Width  int `json:"width"`
	Height int `json:"height"`
	StartX int `json:"startX"`
	StartY int `json:"startY"`
	EndX   int `json:"endX"`
	EndY   int `json:"endY"`
}

func (mc *MapConfig) GenerateMap() *TWMap {
	return &TWMap{
		Width:       mc.Width,
		Height:      mc.Height,
		XStart:      mc.StartX,
		YStart:      mc.StartY,
		XEnd:        mc.EndX,
		YEnd:        mc.EndY,
		Tiles:       makeTiles(mc.Width, mc.Height),
		currentPath: nil,
	}
}

type TowerType struct {
	Name        string        `json:"name"`
	Descritpion string        `json:"description"`
	Levels      []*TowerLevel `json:"levels"`
}

// get the tower level for a given level
func (t *TowerType) Level(level int) *TowerLevel {
	if level < 1 || level > len(t.Levels) {
		return nil
	}
	return t.Levels[level-1]
}

type TowerLevel struct {
	Level       int     `json:"level"`
	Cost        int     `json:"cost"`
	Damage      int     `json:"damage"`
	Range       float64 `json:"range"`
	FireRate    float64 `json:"fireRate"`
	BulletSpeed float64 `json:"bulletSpeed"`
}

func (t *TowerType) Tower(x float64, y float64, level int, id int) *Tower {
	towerLevel := t.Level(level)
	if towerLevel == nil {
		fmt.Printf("Invalid tower level %d for tower type %s\n", level, t.Name)
		return nil
	}
	return &Tower{Id: id, X: x,
		Y: y, Level: level, Damage: towerLevel.Damage,
		Range: towerLevel.Range, FireRate: towerLevel.FireRate,
		BulletSpeed: towerLevel.BulletSpeed, Cooldown: 0,
		Type: t.Name}
}

type MobType struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Key         string  `json:"key"`
	Health      int     `json:"health"`
	Speed       float64 `json:"speed"`
	Reward      int     `json:"reward"`
	Income      int     `json:"income"`
	Cost        int     `json:"cost"`
}

// Make Mob from MobType
func (m *MobType) Mob(x float64, y float64, id int) *Mob {
	return &Mob{Id: id, X: x, Y: y, TargetX: x, TargetY: y, Health: m.Health, MaxHealth: m.Health, Speed: m.Speed, Reward: m.Reward, Type: m.Name}
}

// Standard game config
var StandardGameConfig = GameConfig{
	TowerTypes: []*TowerType{
		{Name: "Arrow", Levels: []*TowerLevel{{Level: 1, Damage: 1, Range: 300, FireRate: 0.4, Cost: 5, BulletSpeed: 180}}},
		{Name: "Siege", Levels: []*TowerLevel{{Level: 1, Damage: 5, Range: 150, FireRate: 0.7, Cost: 15, BulletSpeed: 75}}},
	},
	MobTypes: []*MobType{
		{Name: "Dot", Health: 50, Speed: 50, Reward: 1, Income: 1, Cost: 5},
		{Name: "Circle", Health: 100, Speed: 60, Reward: 2, Income: 2, Cost: 10},
	},
	Map: standardTWMap(),
	StartStats: &Player{
		Money:  50,
		Income: 15,
		Lives:  30,
	},
}

var TestGameConfig = GameConfig{
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

func ReadConfigFromFile(filename string) (*GameConfig, error) {
	// Read file and try to unmarshall it as GameConfig
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var config GameConfig
	err = json.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
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
