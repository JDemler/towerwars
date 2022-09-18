package game

import (
	"encoding/json"
	"fmt"
	"os"
)

// Config contains all configuration for the game. TowerTypes, MobTypes, Map and so on. One config defines the whole content of the game
type Config struct {
	SocialNetworks []*SocialNetworkConfig `json:"socialNetworks"`
	Map            *MapConfig             `json:"map"`
	StartStats     *Player                `json:"startStats"`
	IncomeCooldown int                    `json:"incomeCooldown"`
}

type SocialNetworkConfig struct {
	Key         string       `json:"key"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	TowerTypes  []*TowerType `json:"towerTypes"`
	MobTypes    []*MobType   `json:"mobTypes"`
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

type Effect struct {
	Type     string  `json:"type"` // slow, stun, dot (damage over time), hot (heal over time)
	Value    float64 `json:"value"`
	Duration float64 `json:"duration"`
}

// TowerLevel represents a level of a tower type. Contains all information the tower instance needs
type TowerLevel struct {
	Level        int     `json:"level"`
	Cost         int     `json:"cost"`
	Damage       int     `json:"damage"`
	Range        float64 `json:"range"`
	SplashRadius float64 `json:"splashRadius"`
	SplashDmg    float64 `json:"splashDmg"`
	Effect       *Effect `json:"effect"`
	FireRate     float64 `json:"fireRate"`
	BulletSpeed  float64 `json:"bulletSpeed"`
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
		SplashRadius: towerLevel.SplashRadius, SplashDmg: towerLevel.SplashDmg,
		Effect: towerLevel.Effect, Type: t.Key}
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
	return &Mob{ID: id, X: x, Y: y, TargetX: x, TargetY: y, Health: float64(m.Health), MaxHealth: m.Health, Speed: m.Speed, Reward: m.Reward, Type: m.Name}
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

func (c *Config) getRaceConfigByKey(key string) *SocialNetworkConfig {
	for _, rc := range c.SocialNetworks {
		if rc.Key == key {
			return rc
		}
	}
	return nil
}

// GetTowerTypeByKey looks up GetTowerTypeByKey by key
func (c *Config) GetTowerTypeByKey(race string, key string) *TowerType {
	rc := c.getRaceConfigByKey(race)
	if rc == nil {
		return nil
	}
	for _, t := range rc.TowerTypes {
		if t.Key == key {
			return t
		}
	}
	return nil
}

// GetMobType looks up MobType by key
func (c *Config) GetMobTypeByKey(race string, key string) *MobType {
	rc := c.getRaceConfigByKey(race)
	if rc == nil {
		return nil
	}
	for _, t := range rc.MobTypes {
		if t.Key == key {
			return t
		}
	}
	return nil
}
