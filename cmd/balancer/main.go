package main

import (
	"fmt"
	"os"
	"towerwars/internal/agent"
	"towerwars/internal/game"
)

func readConfig() *game.Config {
	//Try to read config. Get config path from env variable
	var configPath string
	if os.Getenv("CONFIG_PATH") == "" {
		fmt.Println("No config path set. Using default config")
		configPath = "../server/gameConfig.json"
	} else {
		fmt.Println("Using config from: ", os.Getenv("CONFIG_PATH"))
		configPath = os.Getenv("CONFIG_PATH")
	}
	config, err := game.ReadConfigFromFile(configPath)
	if err != nil {
		fmt.Println("Could not read config")
		fmt.Println(err)
		return nil
	}
	return config
}

func getHpOnField(field *game.Field) int {
	hp := 0
	for _, mob := range field.Mobs {
		hp += int(mob.Health)
	}
	return hp
}

func getDpsOnField(field *game.Field) int {
	dps := 0
	for _, tower := range field.Towers {
		dps += int(float64(tower.Damage) / tower.FireRate)
	}
	return dps
}

func main() {
	config := readConfig()
	if config == nil {
		return
	}

	// Start g with 1 player and 1 god player
	g := game.NewGame(config)
	g.AddPlayer("agent1", "facebook")
	g.AddPlayer("agent2", "facebook")

	// Add 2 agents
	agent1 := agent.NewAgent(g, 0, agent.NaiveAgentConfig(), "facebook")
	agent2 := agent.NewAgent(g, 1, agent.NaiveAgentConfig(), "facebook")

	// give player1  a headstart
	g.Fields[0].Player.Income = 5000

	g.Start()
	// Data to put in csv later for plotting and analysis
	var data [][]int

	// simulate 1000 seconds
	for i := 0; i < 1000; i++ {
		events := g.Update(1)
		// check if both players are still alive
		if len(g.Fields) <= 1 {
			break
		}

		sevents1, _ := g.HandleEvents(agent1.Act(events))
		sevents2, _ := g.HandleEvents(agent2.Act(events))

		sevents := append(sevents1, sevents2...)
		agent1.HandleEvents(sevents)
		agent2.HandleEvents(sevents)

		data = append(data, []int{g.GetMobsSent(), g.GetTowersBuilt(), g.Fields[0].Player.Income / 100, g.Fields[0].Player.Money / 100,
			g.Fields[0].Player.Lives, getHpOnField(g.Fields[0]), getDpsOnField(g.Fields[0]), g.Fields[1].Player.Income / 100, g.Fields[1].Player.Money / 100,
			g.Fields[1].Player.Lives, getHpOnField(g.Fields[1]), getDpsOnField(g.Fields[1])})
	}

	// Write data to csv
	file, err := os.Create("data.csv")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	_, err = file.WriteString("step,mobsSent,towersBuilt,p1_income,p1_money,p1_lives,p1_hp,p1_dps,p2_income,p2_money,p2_lives,p2_hp,p2_dps\n")
	if err != nil {
		fmt.Println(err)
		return
	}

	for i, value := range data {
		// intersperse with commas
		_, err = file.WriteString(fmt.Sprintf("%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d\n", i, value[0], value[1], value[2], value[3], value[4], value[5], value[6], value[7], value[8], value[9], value[10], value[11]))
		if err != nil {
			fmt.Println(err)
			file.Close()
			return
		}
	}
}
