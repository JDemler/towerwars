package game

import (
	"encoding/json"
	"fmt"
	"os"
)

// Config contains all configuration for the game. TowerTypes, MobTypes, Map and so on. One config defines the whole content of the game
type Config struct {
	TowerTypes     []*TowerType `json:"towerTypes"`
	MobTypes       []*MobType   `json:"mobTypes"`
	Map            *MapConfig   `json:"map"`
	StartStats     *Player      `json:"startStats"`
	IncomeCooldown int          `json:"incomeCooldown"`
}

// MapConfig contains all information about the map
type MapConfig struct {
	Width  int `json:"width"`
	Height int `json:"height"`
	StartX int `json:"startX"`
	StartY int `json:"startY"`
	EndX   int `json:"endX"`
	EndY   int `json:"endY"`
}

// GenerateMap a map instance for the game
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

// TowerType represents a tower type with all levels
type TowerType struct {
	Name        string        `json:"name"`
	Descritpion string        `json:"description"`
	Key         string        `json:"key"`
	Levels      []*TowerLevel `json:"levels"`
}

// GetLevel the tower level for a given level
func (t *TowerType) GetLevel(level int) *TowerLevel {
	if level < 1 || level > len(t.Levels) {
		return nil
	}
	return t.Levels[level-1]
}

// TowerLevel represents a level of a tower type. Contains all information the tower instance needs
type TowerLevel struct {
	Level       int     `json:"level"`
	Cost        int     `json:"cost"`
	Damage      int     `json:"damage"`
	Range       float64 `json:"range"`
	FireRate    float64 `json:"fireRate"`
	BulletSpeed float64 `json:"bulletSpeed"`
}

// Tower creates a new tower instance from a tower type and a level
func (t *TowerType) Tower(x float64, y float64, level int, id int) *Tower {
	towerLevel := t.GetLevel(level)
	if towerLevel == nil {
		fmt.Printf("Invalid tower level %d for tower type %s\n", level, t.Key)
		return nil
	}
	return &Tower{ID: id, X: x,
		Y: y, Level: level, Damage: towerLevel.Damage,
		Range: towerLevel.Range, FireRate: towerLevel.FireRate,
		BulletSpeed: towerLevel.BulletSpeed, Cooldown: 0,
		Type: t.Key}
}

// MobType represents a mob type with necessaray information
type MobType struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Key         string  `json:"key"`
	Health      int     `json:"health"`
	Speed       float64 `json:"speed"`
	Reward      int     `json:"reward"`
	Income      int     `json:"income"`
	Cost        int     `json:"cost"`
	Respawn     float64 `json:"respawn"`
	Delay       float64 `json:"delay"`
}

// MakeMob from MobType
func (m *MobType) MakeMob(x float64, y float64, id int) *Mob {
	return &Mob{ID: id, X: x, Y: y, TargetX: x, TargetY: y, Health: m.Health, MaxHealth: m.Health, Speed: m.Speed, Reward: m.Reward, Type: m.Name}
}

// ReadConfigFromFile reads a game config from a file
func ReadConfigFromFile(filename string) (*Config, error) {
	// Read file and try to unmarshall it as GameConfig
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var config Config
	err = json.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// GetTowerTypeByName looks up GetTowerTypeByName by name
func (g *Config) GetTowerTypeByName(name string) *TowerType {
	for _, t := range g.TowerTypes {
		if t.Name == name {
			return t
		}
	}
	return nil
}

// GetTowerTypeByKey looks up GetTowerTypeByKey by key
func (g *Config) GetTowerTypeByKey(key string) *TowerType {
	for _, t := range g.TowerTypes {
		if t.Key == key {
			return t
		}
	}
	return nil
}

// GetMobType looks up MobType by name
func (g *Config) GetMobType(name string) *MobType {
	for _, t := range g.MobTypes {
		if t.Name == name {
			return t
		}
	}
	return nil
}
