package game

import (
	"encoding/json"
	"fmt"
)

type FieldEvent struct {
	FieldId int
	Type    string
	Payload string
}

// Unpack FieldEvent to Event
func (e FieldEvent) Unpack() Event {
	switch e.Type {
	case "build":
		res := NewBuildEvent(e.FieldId)
		json.Unmarshal([]byte(e.Payload), &res)
		return res
	case "buy_mob":
		res := NewBuyMobEvent(e.FieldId)
		json.Unmarshal([]byte(e.Payload), &res)
		return res
	}
	return nil
}

type Event interface {
	TryExecute(sourceField *Field, targetFields []*Field) bool
	FieldId() int
	TargetFieldIds() []int
}

type BuildEvent struct {
	fieldId   int
	X         int    `json:"x"`
	Y         int    `json:"y"`
	TowerType string `json:"tower_type"`
}

func NewBuildEvent(fieldId int) BuildEvent {
	return BuildEvent{fieldId: fieldId}
}

// implement Event for BuildEvent
func (e BuildEvent) TryExecute(sourceField *Field, targetFields []*Field) bool {
	// Check if position is within twmap bounds
	if e.X < 0 || e.X >= sourceField.TWMap.Width || e.Y < 0 || e.Y >= sourceField.TWMap.Height {
		return false
	}
	// check if tower is already built
	if sourceField.TWMap.IsOccupied(e.X, e.Y) {
		return false
	}
	// Get TowerType from StandardGameConfig
	towerType := StandardGameConfig.TowerType(e.TowerType)
	if towerType == nil {
		return false
	}
	// Check if player can affort tower
	if sourceField.Player.Money < towerType.Cost {
		return false
	}
	tower := towerType.Tower(float64(e.X)*TileSize+TileSize/2, float64(e.Y)*TileSize+TileSize/2)
	//Occupy tower position in twmap
	sourceField.TWMap.Occupy(e.X, e.Y)
	sourceField.Towers = append(sourceField.Towers, tower)
	return true
}

func (e BuildEvent) FieldId() int {
	return e.fieldId
}

func (e BuildEvent) TargetFieldIds() []int {
	return []int{}
}

type SellEvent struct {
	X int
	Y int
}

type UpgradeEvent struct {
	X int
	Y int
}

type BuyMobEvent struct {
	fieldId       int
	TargetFieldId int    `json:"target_field_id"`
	MobType       string `json:"mob_type"`
}

func NewBuyMobEvent(fieldId int) BuyMobEvent {
	return BuyMobEvent{fieldId: fieldId}
}

// implement Event for BuyMobEvent
func (e BuyMobEvent) TryExecute(sourceField *Field, targetFields []*Field) bool {
	// Check if player can afford mob
	mobType := StandardGameConfig.MobType(e.MobType)
	if mobType == nil {
		// Invalid mob type
		fmt.Println("Invalid mob type")
		return false
	}
	if sourceField.Player.Money < mobType.Cost {
		// Player cannot afford mob
		fmt.Println("Player cannot afford mob")
		return false
	}
	// Reduce player money
	sourceField.Player.Money -= mobType.Cost
	// Increase player income
	sourceField.Player.Income += mobType.Income
	// range over targetFields and add mob to all of them
	for _, targetField := range targetFields {
		//Get startposition
		startX, startY := targetField.TWMap.StartPosition()
		mob := mobType.Mob(float64(startX)*TileSize+TileSize/2, float64(startY)*TileSize+TileSize/2)
		targetField.Mobs = append(targetField.Mobs, mob)
	}
	return true
}

func (e BuyMobEvent) FieldId() int {
	return e.fieldId
}

func (e BuyMobEvent) TargetFieldIds() []int {
	return []int{e.TargetFieldId}
}
