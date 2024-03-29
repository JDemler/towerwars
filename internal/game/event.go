package game

import (
	"encoding/json"
	"fmt"
)

// FieldEvent is a generic event that will be sent from the client to the server
type FieldEvent struct {
	FieldID int    `json:"fieldId"`
	Key     string `json:"key"`
	Type    string `json:"eventType"`
	Payload Event  `json:"payload"`
}

// UnmarshalJSON implements the json.Unmarshaler interface
func (e *FieldEvent) UnmarshalJSON(data []byte) error {
	var f struct {
		FieldID int             `json:"fieldId"`
		Key     string          `json:"key"`
		Type    string          `json:"eventType"`
		Payload json.RawMessage `json:"payload"`
	}
	if err := json.Unmarshal(data, &f); err != nil {
		return err
	}
	e.FieldID = f.FieldID
	e.Key = f.Key
	e.Type = f.Type
	switch f.Type {
	case "buyMob":
		var payload BuyMobEvent
		if err := json.Unmarshal(f.Payload, &payload); err != nil {
			return err
		}
		e.Payload = &payload
	case "buildTower":
		var payload BuildEvent
		if err := json.Unmarshal(f.Payload, &payload); err != nil {
			return err
		}
		e.Payload = &payload
	case "sellTower":
		var payload SellEvent
		if err := json.Unmarshal(f.Payload, &payload); err != nil {
			return err
		}
		e.Payload = &payload
	case "upgradeTower":
		var payload UpgradeEvent
		if err := json.Unmarshal(f.Payload, &payload); err != nil {
			return err
		}
		e.Payload = &payload
	case "upgradeMobType":
		var payload UpgradeMobTypeEvent
		if err := json.Unmarshal(f.Payload, &payload); err != nil {
			return err
		}
		e.Payload = &payload
	}
	return nil
}

// Event is a generic event that will be sent from the client to the server
type Event interface {
	TryExecute(sourceField *Field, targetFields *Field, gc *Config) ([]*ServerEvent, error)
}

// BuildEvent is sent from the client to the server when a player wants to build a tower
type BuildEvent struct {
	X         int    `json:"x"`
	Y         int    `json:"y"`
	TowerType string `json:"towerType"`
}

// TryExecute a BuildEvent to build a tower
func (e BuildEvent) TryExecute(sourceField *Field, targetField *Field, gc *Config) ([]*ServerEvent, error) {
	// Check if position is within twmap bounds
	if e.X < 0 || e.X >= sourceField.TWMap.Width || e.Y < 0 || e.Y >= sourceField.TWMap.Height {
		return nil, fmt.Errorf("Position out of bounds")
	}
	// check if tower is already built
	if sourceField.TWMap.isOccupied(e.X, e.Y) {
		return nil, fmt.Errorf("Position already occupied")
	}
	// Get TowerType from gameConfig
	towerType := gc.GetTowerTypeByKey(sourceField.SocialNetwork, e.TowerType)
	if towerType == nil {
		return nil, fmt.Errorf("Invalid tower type %s", e.TowerType)
	}
	towerLevel := towerType.GetLevel(1)
	if towerLevel == nil {
		return nil, fmt.Errorf("Invalid tower level %d", 1)
	}
	// Check if player can affort tower
	if sourceField.Player.Money < towerLevel.Cost {
		return nil, fmt.Errorf("Player cannot afford tower")
	}
	tower := towerType.Tower(float64(e.X)+0.5, float64(e.Y)+0.5, 1, sourceField.getNextTowerID())
	//Occupy tower position in twmap
	newPath := sourceField.TWMap.occupy(e.X, e.Y)
	sourceField.Towers = append(sourceField.Towers, tower)
	sourceField.Player.Money -= towerLevel.Cost
	return []*ServerEvent{createEvent(tower, sourceField.ID), updateEvent(sourceField.Player, sourceField.ID), updateEvent(&newPath, sourceField.ID)}, nil
}

// SellEvent is sent from the client to the server when a player wants to sell a tower
type SellEvent struct {
	TowerID int `json:"towerId"`
}

// TryExecute a SellEvent to sell a tower
func (e SellEvent) TryExecute(sourceField *Field, targetField *Field, gc *Config) ([]*ServerEvent, error) {
	// Check if tower exists
	tower := sourceField.GetTowerByID(e.TowerID)
	if tower == nil {
		return nil, fmt.Errorf("Tower %d does not exist", e.TowerID)
	}
	towerType := gc.GetTowerTypeByKey(sourceField.SocialNetwork, tower.Type)
	if towerType == nil {
		return nil, fmt.Errorf("Invalid tower type %s", tower.Type)
	}
	newPath := sourceField.TWMap.free(int((tower.X - 0.5)), int((tower.Y - 0.5)))
	sourceField.removeTowerByID(e.TowerID)
	sourceField.Player.Money += towerType.GetLevel(tower.Level).Cost * 0.8
	return []*ServerEvent{deleteEvent(tower, sourceField.ID), updateEvent(sourceField.Player, sourceField.ID), updateEvent(&newPath, sourceField.ID)}, nil
}

// UpgradeEvent is sent from the client to the server when a player wants to upgrade a tower
type UpgradeEvent struct {
	TowerID int `json:"towerId"`
}

// TryExecute UpgradeEvent to upgrade a tower
func (e UpgradeEvent) TryExecute(sourceField *Field, targetField *Field, gc *Config) ([]*ServerEvent, error) {
	// Check if tower exists
	tower := sourceField.GetTowerByID(e.TowerID)
	if tower == nil {
		return nil, fmt.Errorf("Tower not found")
	}
	// Get TowerType from gameConfig
	towerType := gc.GetTowerTypeByKey(sourceField.SocialNetwork, tower.Type)
	if towerType == nil {
		return nil, fmt.Errorf("Invalid tower type %s", tower.Type)
	}
	towerLevel := towerType.GetLevel(tower.Level + 1)
	if towerLevel == nil {
		return nil, fmt.Errorf("Invalid tower level %d", tower.Level+1)
	}
	// Check if player can affort tower
	if sourceField.Player.Money < towerLevel.Cost {
		return nil, fmt.Errorf("Player cannot afford tower")
	}
	// Upgrade tower
	tower.Upgrade(towerLevel)
	sourceField.Player.Money -= towerLevel.Cost
	return []*ServerEvent{updateEvent(tower, sourceField.ID), updateEvent(sourceField.Player, sourceField.ID)}, nil
}

// TargetFieldIds is empty for UpgradeEvent
func (e UpgradeEvent) TargetFieldIds() []int {
	return []int{}
}

// BuyMobEvent is sent from the client to the server when a player wants to buy a mob
type BuyMobEvent struct {
	MobType string `json:"mobType"`
}

// TryExecute BuyMobEvent to buy a mob
func (e BuyMobEvent) TryExecute(sourceField *Field, targetField *Field, config *Config) ([]*ServerEvent, error) {
	// Check if barracks have mob to send
	canSend, mobLevel := sourceField.Barracks.TrySend(e.MobType)
	if !canSend {
		// Barracks do not have mob to send
		fmt.Println("Barracks do not have mob to send")
		return nil, fmt.Errorf("Barracks do not have mob to send")
	}
	// Check if player can afford mob
	mobType := config.GetMobTypeByKey(sourceField.SocialNetwork, e.MobType, mobLevel)
	if mobType == nil {
		// Invalid mob type
		fmt.Println("Invalid mob type")
		return nil, fmt.Errorf("Invalid mob type")
	}
	if sourceField.Player.Money < mobType.Cost {
		// Player cannot afford mob
		fmt.Println("Player cannot afford mob")
		return nil, fmt.Errorf("Player cannot afford mob")
	}

	// Reduce player money
	sourceField.Player.Money -= mobType.Cost
	// Increase player income
	sourceField.Player.Income += mobType.Income
	gameEvents := []*ServerEvent{}

	//Get startposition
	startX, startY := targetField.TWMap.startPosition()
	mobID := targetField.getNextMobID()
	mob := mobType.MakeMob(float64(startX)+0.5, float64(startY)+0.5, mobID)
	mob.SentFromFieldID = sourceField.ID
	targetField.Mobs = append(targetField.Mobs, mob)
	gameEvents = append(gameEvents, createEvent(mob, targetField.ID))
	gameEvents = append(gameEvents, updateEvent(sourceField.Barracks, sourceField.ID))

	// Send playerUpdated event
	gameEvents = append(gameEvents, updateEvent(sourceField.Player, sourceField.ID))
	return gameEvents, nil
}

type UpgradeMobTypeEvent struct {
	MobType string `json:"mobType"`
}

// TargetFieldIds is empty for UpgradeEvent
func (e UpgradeMobTypeEvent) TargetFieldIds() []int {
	return []int{}
}

func (e UpgradeMobTypeEvent) TryExecute(sourceField *Field, targetField *Field, config *Config) ([]*ServerEvent, error) {
	mobLevel := sourceField.Barracks.GetMobTypeLevel(e.MobType)
	mobType := config.GetMobTypeByKey(sourceField.SocialNetwork, e.MobType, mobLevel)
	if mobType == nil {
		return nil, fmt.Errorf("Invalid mob type")
	}
	if sourceField.Player.Money < mobType.LevelUpCost(config) {
		return nil, fmt.Errorf("Player cannot afford to level up mob")
	}
	sourceField.Player.Money -= mobType.LevelUpCost(config)
	mobType = config.GetMobTypeByKey(sourceField.SocialNetwork, e.MobType, mobLevel+1)
	sourceField.Barracks.LevelUpMobType(*mobType)
	return []*ServerEvent{updateEvent(sourceField.Barracks, sourceField.ID), updateEvent(sourceField.Player, sourceField.ID)}, nil
}
