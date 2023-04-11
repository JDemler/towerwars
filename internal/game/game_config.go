package game

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"os"
	"strings"

	"gopkg.in/yaml.v2"
)

// Config contains all configuration for the game. TowerTypes, MobTypes, Map and so on. One config defines the whole content of the game
type Config struct {
	SocialNetworks   []*SocialNetworkConfig `json:"socialNetworks" yaml:"socialNetworks"`
	MobLevelUpConfig *UpgradeMobTypeConfig  `json:"upgradeMobTypeConfig" yaml:"upgradeMobTypeConfig"`
	Map              *MapConfig             `json:"map" yaml:"map"`
	StartStats       *Player                `json:"startStats" yaml:"startStats"`
	IncomeCooldown   int                    `json:"incomeCooldown" yaml:"incomeCooldown"`
}

type MetaConfig struct {
	TowerDmgFactor   float64 `json:"towerDmgFactor" yaml:"towerDmgFactor"`
	TowerRangeFactor float64 `json:"towerRangeFactor" yaml:"towerRangeFactor"`
	TowerCostFactor  float64 `json:"towerCostFactor" yaml:"towerCostFactor"`
	MobHpFactor      float64 `json:"mobHpFactor" yaml:"mobHpFactor"`
	MobSpeedFactor   float64 `json:"mobSpeedFactor" yaml:"mobSpeedFactor"`
	MobIncomeFactor  float64 `json:"mobIncomeFactor" yaml:"mobIncomeFactor"`
	MobCostFactor    float64 `json:"mobCostFactor" yaml:"mobCostFactor"`
	BarracksFactor   float64 `json:"barracksFactor" yaml:"barracksFactor"`
}

func ReadMetaConfigFromFile(filename string) (*MetaConfig, error) {
	// Read file and try to unmarshall it as GameConfig
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var config MetaConfig
	err = json.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func (mc *MetaConfig) Apply(config *Config) *Config {
	// apply all factor from metaconfig to config
	for _, rc := range config.SocialNetworks {
		for _, t := range rc.TowerTypes {
			for _, l := range t.Levels {
				l.Damage *= mc.TowerDmgFactor
				l.Range *= mc.TowerRangeFactor
				l.Cost *= mc.TowerCostFactor
			}
		}
		for _, m := range rc.MobTypes {
			m.Health *= mc.MobHpFactor
			m.Speed *= mc.MobSpeedFactor
			m.Reward *= mc.MobIncomeFactor
			m.Delay *= mc.BarracksFactor
			m.Respawn *= mc.BarracksFactor
			m.Cost *= mc.MobCostFactor
		}
	}
	return config
}

type SocialNetworkConfig struct {
	Key         string       `json:"key" yaml:"key"`
	Name        string       `json:"name" yaml:"name"`
	Description string       `json:"description" yaml:"description"`
	TowerTypes  []*TowerType `json:"towerTypes" yaml:"towerTypes"`
	MobTypes    []*MobType   `json:"mobTypes" yaml:"mobTypes"`
}

// MapConfig contains all information about the map
type MapConfig struct {
	Width  int `json:"width" yaml:"width"`
	Height int `json:"height" yaml:"height"`
	StartX int `json:"startX" yaml:"startX"`
	StartY int `json:"startY" yaml:"startY"`
	EndX   int `json:"endX" yaml:"endX"`
	EndY   int `json:"endY" yaml:"endY"`
}

// GenerateMap a map instance for the game
func (mc *MapConfig) GenerateMap() *TWMap {
	resMap := &TWMap{
		Width:       mc.Width,
		Height:      mc.Height,
		XStart:      mc.StartX,
		YStart:      mc.StartY,
		XEnd:        mc.EndX,
		YEnd:        mc.EndY,
		Tiles:       makeTiles(mc.Width, mc.Height),
		CurrentPath: nil,
	}
	resMap.calculatePath()
	return resMap
}

// TowerType represents a tower type with all levels
type TowerType struct {
	Name        string        `json:"name" yaml:"name"`
	Description string        `json:"description" yaml:"description"`
	Key         string        `json:"key" yaml:"key"`
	Levels      []*TowerLevel `json:"levels" yaml:"levels"`
}

// GetLevel the tower level for a given level
func (t *TowerType) GetLevel(level int) *TowerLevel {
	if level < 1 || level > len(t.Levels) {
		return nil
	}
	return t.Levels[level-1]
}

type Effect struct {
	Type     string  `json:"type" yaml:"type"` // slow, stun, dot (damage over time), hot (heal over time)
	Value    float64 `json:"value" yaml:"value"`
	Duration float64 `json:"duration" yaml:"duration"`
}

// TowerLevel represents a level of a tower type. Contains all information the tower instance needs
type TowerLevel struct {
	Level        int     `json:"level" yaml:"level"`
	Cost         float64 `json:"cost" yaml:"cost"`
	Damage       float64 `json:"damage" yaml:"damage"`
	Range        float64 `json:"range" yaml:"range"`
	SplashRadius float64 `json:"splashRadius" yaml:"splashRadius"`
	SplashDmg    float64 `json:"splashDmg" yaml:"splashDmg"`
	Effect       *Effect `json:"effect" yaml:"effect"`
	FireRate     float64 `json:"fireRate" yaml:"fireRate"`
	BulletSpeed  float64 `json:"bulletSpeed" yaml:"bulletSpeed"`
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
	Name        string  `json:"name" yaml:"name"`
	Description string  `json:"description" yaml:"description"`
	Key         string  `json:"key" yaml:"key"`
	Health      float64 `json:"health" yaml:"health"`
	Speed       float64 `json:"speed" yaml:"speed"`
	Reward      float64 `json:"reward" yaml:"reward"`
	Income      float64 `json:"income" yaml:"income"`
	Cost        float64 `json:"cost" yaml:"cost"`
	Respawn     float64 `json:"respawn" yaml:"respawn"`
	Delay       float64 `json:"delay" yaml:"delay"`
	MaxStock    int     `json:"maxStock" yaml:"maxStock"`
}

type UpgradeMobTypeConfig struct {
	UpgradeCostFactor float64 `json:"upgradeCostFactor" yaml:"upgradeCostFactor"`
	HealthFactor      float64 `json:"healthFactor" yaml:"healthFactor"`
	SpeedFactor       float64 `json:"speedFactor" yaml:"speedFactor"`
	RewardFactor      float64 `json:"rewardFactor" yaml:"rewardFactor"`
	IncomeFactor      float64 `json:"incomeFactor" yaml:"incomeFactor"`
	CostFactor        float64 `json:"costFactor" yaml:"costFactor"`
	RespawnFactor     float64 `json:"respawnFactor" yaml:"respawnFactor"`
	DelayFactor       float64 `json:"delayFactor" yaml:"delayFactor"`
}

func (m *MobType) LevelUpCost(config *Config) float64 {
	return m.Cost * config.MobLevelUpConfig.UpgradeCostFactor
}

func (m *MobType) LevelUp(config *UpgradeMobTypeConfig, level int) MobType {
	leveledUp := *m
	leveledUp.Health *= math.Pow(config.HealthFactor, float64(level))
	leveledUp.Speed *= math.Pow(config.SpeedFactor, float64(level))
	leveledUp.Reward *= math.Pow(config.RewardFactor, float64(level))
	leveledUp.Income *= math.Pow(config.IncomeFactor, float64(level))
	leveledUp.Cost *= math.Pow(config.CostFactor, float64(level))
	leveledUp.Respawn *= math.Pow(config.RespawnFactor, float64(level))
	leveledUp.Delay *= math.Pow(config.DelayFactor, float64(level))
	return leveledUp
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

func ReadSocialNetworkConfigFromFile(filename string) (*SocialNetworkConfig, error) {
	// Read file and try to unmarshall it as GameConfig
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var config SocialNetworkConfig
	// check if file is json or yaml
	if strings.HasSuffix(filename, ".json") {
		//unmarshal json
		err = json.Unmarshal(data, &config)
	} else if strings.HasSuffix(filename, ".yaml") || strings.HasSuffix(filename, ".yml") {
		//unmarshal yaml disallowing unknown fields
		err = yaml.UnmarshalStrict(data, &config)
	} else {
		return nil, errors.New("invalid file format")
	}
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
func (c *Config) GetMobTypeByKey(race string, key string, level int) *MobType {
	rc := c.getRaceConfigByKey(race)
	if rc == nil {
		return nil
	}
	for _, t := range rc.MobTypes {
		if t.Key == key {
			leveledUp := t.LevelUp(c.MobLevelUpConfig, level)
			return &leveledUp
		}
	}
	return nil
}
