package main

import (
	"fmt"
	"os"
	"towerwars/internal/game"
)

func printMobRatiosTable(mobTypes []*game.MobType) {

	fmt.Printf("| %-20s | %-15s | %-20s | %-12s |\n", "Mob", "Value", "Difficulty", "Income ")
	fmt.Printf("| %-20s | %-15s | %-20s | %-12s |\n", "---------------", "---------------", "--------------------", "------------")

	for _, mob := range mobTypes {
		mobValueRatio := mob.Reward / mob.Cost
		mobDifficultyRatio := (mob.Health * mob.Speed) / mob.Cost
		incomeRatio := mob.Income / mob.Cost

		fmt.Printf("| %-20s | %-15.2f | %-20.2f | %-12.2f |\n", mob.Name, mobValueRatio, mobDifficultyRatio, incomeRatio)
	}

}

func main() {
	networks := []*game.SocialNetworkConfig{}
	// iterate files in networkconfigs folder
	files, err := os.ReadDir("../server/networkconfigs")
	if err != nil {
		fmt.Println(err)
	}
	for _, f := range files {
		//read file
		networkConfig, err := game.ReadSocialNetworkConfigFromFile("../server/networkconfigs/" + f.Name())
		if err != nil {
			fmt.Println(err)
		}
		//add to config
		networks = append(networks, networkConfig)
	}

	// Add your list of MobType here and call the printMobRatiosTable function
	for _, network := range networks {
		// print network name
		fmt.Println(network.Name)
		printMobRatiosTable(network.MobTypes)
		// print newline
		fmt.Println()
	}
}
