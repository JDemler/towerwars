package agent

// Agent that plays socialmediawars

import (
	"fmt"
	"towerwars/internal/game"
)

type Agent struct {
	game       *game.Game
	playerID   int
	config     *Config
	state      *State
	barracks   *game.Barracks
	race       string
	towerTypes []*game.TowerType
}

type State struct {
	lives  int
	money  float64
	income float64
}

type Config struct {
	BuildOrder []BuildPosition
	BuildSplit float64
}

type BuildPosition struct {
	x int
	y int
}

func NewAgent(game *game.Game, playerID int, config *Config) *Agent {
	return &Agent{
		game:       game,
		playerID:   playerID,
		config:     config,
		state:      &State{},
		race:       "facebook",
		towerTypes: game.GetTowerTypes(playerID),
	}
}

func (a *Agent) HandleEvents(events []*game.ServerEvent) {
	for _, event := range events {
		if event.FieldID != a.playerID {
			continue
		}
		// Log event
		fmt.Printf("Event for player %d: %+v\n", a.playerID, event)
		fmt.Printf("Payload %+v\n", event.Payload)

		switch event.Type {
		case "player":
			if event.Kind == "update" {
				crudObject := event.Payload.(*game.CrudObject)
				player := (*crudObject).(*game.Player)
				a.state.lives = (*player).Lives
				a.state.money = float64((*player).Money / 100)
				a.state.income = float64((*player).Income)
			}
		case "barracks":
			if event.Kind == "update" {
				crudObject := event.Payload.(*game.CrudObject)
				a.barracks = (*crudObject).(*game.Barracks)
			}
		case "tower":
			if event.Kind == "create" {
				crudObject := event.Payload.(*game.CrudObject)
				tower := (*crudObject).(*game.Tower)
				a.RemoveFromBuildOrder(int(tower.X), int(tower.Y))
				fmt.Println("Removed tower from build order")
			}
		}
	}
}

func (a *Agent) RemoveFromBuildOrder(x int, y int) {
	for i, buildPosition := range a.config.BuildOrder {
		if buildPosition.x == x && buildPosition.y == y {
			a.config.BuildOrder = append(a.config.BuildOrder[:i], a.config.BuildOrder[i+1:]...)
			return
		}
	}
}

func (a *Agent) Act(events []*game.ServerEvent) []game.FieldEvent {
	a.HandleEvents(events)
	outEvents := []game.FieldEvent{}
	// split money between sending mobs and building towers
	mobMoney := a.state.money * (1 - a.config.BuildSplit)
	towerMoney := a.state.money * a.config.BuildSplit

	// send mobs
	if a.barracks != nil {
		mobType := a.mostSensibleMobType(mobMoney)
		if mobType != nil {
			buyMobEvent := game.BuyMobEvent{TargetFieldID: 1 - a.playerID, MobType: mobType.Key}
			outEvents = append(outEvents, game.FieldEvent{FieldID: a.playerID, Type: "buyMob", Payload: buyMobEvent})
		}
	}

	// build towers
	towerType := a.mostSensibleTowerType(towerMoney)
	if towerType != nil {
		// get next position in build queue and remove it from list
		if len(a.config.BuildOrder) > 0 {
			buildPosition := a.config.BuildOrder[0]
			buildTowerEvent := game.BuildEvent{X: buildPosition.x, Y: buildPosition.y, TowerType: towerType.Key}
			outEvents = append(outEvents, game.FieldEvent{FieldID: a.playerID, Type: "buildTower", Payload: buildTowerEvent})
		}
	}

	return outEvents
}

func (a *Agent) mostSensibleTowerType(towerMoney float64) *game.TowerType {
	winningDps := 0.0
	var winningTowerType *game.TowerType
	for _, towerType := range a.towerTypes {
		towerLevel := towerType.GetLevel(1)
		dps := float64(towerLevel.Damage) * float64(towerLevel.FireRate)
		if float64(towerLevel.Cost) < towerMoney && dps > winningDps {
			winningDps = dps
			winningTowerType = towerType
		}
	}
	return winningTowerType
}

func (a *Agent) mostSensibleMobType(mobMoney float64) *game.MobType {
	winningRoi := 0.0
	winningMobType := ""
	for _, mobSlot := range a.barracks.Mobs {
		if mobSlot.Count > 0 {
			mobType := a.game.Config.GetMobTypeByKey(a.race, mobSlot.MobType)
			roi := float64(mobType.Income) / float64(mobType.Cost)
			if float64(mobType.Cost) < mobMoney && roi > winningRoi {
				winningRoi = roi
				winningMobType = mobSlot.MobType
			}
		}
	}
	return a.game.Config.GetMobTypeByKey(a.race, winningMobType)
}
