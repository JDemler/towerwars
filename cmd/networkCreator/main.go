package main

// Little program that creates socialnetwork configs configs for towerwars networks

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"os"
	"towerwars/internal/game"
)

func towerDps(step int) int {
	return 10 + step*10
}

func mobHp(step int) int {
	return 100 + step*100
}

func towerFromStep(step int) *game.TowerType {
	return &game.TowerType{
		Name:        fmt.Sprintf("Tower%d", step),
		Description: fmt.Sprintf("Tower%d", step),
		Key:         fmt.Sprintf("tower%d", step),
		Levels: []*game.TowerLevel{
			{
				Level:        1,
				Cost:         100,
				Damage:       float64(towerDps(step)),
				Range:        1.5,
				SplashRadius: 0,
				SplashDmg:    0,
				Effect:       nil,
				FireRate:     1,
				BulletSpeed:  1,
			},
		},
	}
}

// nolint:deadcode,unused
func towerValueFunction(step int) float64 {
	return 1.0
}

// nolint:deadcode,unused
func towerLevelToValue(level game.TowerLevel) float64 {
	return float64(level.Damage) * level.FireRate * math.Log(level.Range+1)
}

func mobFromStep(step int) *game.MobType {
	return &game.MobType{
		Name:        fmt.Sprintf("Mob%d", step),
		Description: fmt.Sprintf("Mob%d", step),
		Key:         fmt.Sprintf("mob%d", step),
		Health:      float64(mobHp(step)),
		Speed:       1,
		Reward:      10,
		Income:      10,
		Cost:        10,
		Respawn:     0.1,
		Delay:       0,
	}
}

func main() {
	towers := []*game.TowerType{}
	mobs := []*game.MobType{}
	for i := 1; i <= 10; i++ {
		towers = append(towers, towerFromStep(i))
		mobs = append(mobs, mobFromStep(i))
	}
	network := game.SocialNetworkConfig{
		TowerTypes:  towers,
		MobTypes:    mobs,
		Key:         "socialnetwork",
		Name:        "Social Network",
		Description: "Social Network",
	}

	// create network.json file
	file, err := os.Create("network.json")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	enc := json.NewEncoder(file)
	enc.SetIndent("", "  ")
	err = enc.Encode(network)
	if err != nil {
		log.Fatal(err)
	}
}
