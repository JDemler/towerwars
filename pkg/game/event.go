package game

import (
	"encoding/json"
	"fmt"
)

type GameEvent struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type PlayerJoinedEvent struct {
	Player *Player `json:"player"`
}

type GameStateChangedEvent struct {
	GameState string `json:"gameState"`
}

type MobCreatedEvent struct {
	FieldId int  `json:"fieldId"`
	Mob     *Mob `json:"mob"`
}

type TowerCreatedEvent struct {
	FieldId int    `json:"fieldId"`
	Tower   *Tower `json:"tower"`
}

type BulletCreatedEvent struct {
	FieldId int     `json:"fieldId"`
	Bullet  *Bullet `json:"bullet"`
}

type MobDestroyedEvent struct {
	FieldId int `json:"fieldId"`
	MobId   int `json:"mobId"`
}

type MobUpdateEvent struct {
	FieldId int  `json:"fieldId"`
	Mob     *Mob `json:"mob"`
}

type TowerDestroyedEvent struct {
	FieldId int `json:"fieldId"`
	TowerId int `json:"towerId"`
}

type BulletDestroyedEvent struct {
	FieldId  int `json:"fieldId"`
	BulletId int `json:"bulletId"`
}

type PlayerUpdatedEvent struct {
	FieldId int     `json:"fieldId"`
	Player  *Player `json:"player"`
}

type FieldEvent struct {
	FieldId int    `json:"fieldId"`
	Key     string `json:"key"`
	Type    string `json:"eventType"`
	Payload string `json:"payload"`
}

// Unpack FieldEvent to Event
func (e FieldEvent) Unpack() Event {
	switch e.Type {
	case "buildTower":
		res := NewBuildEvent(e.FieldId)
		json.Unmarshal([]byte(e.Payload), &res)
		return res
	case "buyMob":
		res := NewBuyMobEvent(e.FieldId)
		json.Unmarshal([]byte(e.Payload), &res)
		return res
	}
	return nil
}

type Event interface {
	TryExecute(sourceField *Field, targetFields []*Field, gc *GameConfig) ([]*GameEvent, error)
	FieldId() int
	TargetFieldIds() []int
	ToJson() string
}

type BuildEvent struct {
	fieldId   int
	X         int    `json:"x"`
	Y         int    `json:"y"`
	TowerType string `json:"towerType"`
}

func NewBuildEvent(fieldId int) BuildEvent {
	return BuildEvent{fieldId: fieldId}
}

// implement Event for BuildEvent
func (e BuildEvent) TryExecute(sourceField *Field, targetFields []*Field, gc *GameConfig) ([]*GameEvent, error) {
	// Debuglog event
	fmt.Printf("BuildEvent: %+v\n", e)
	// Check if position is within twmap bounds
	if e.X < 0 || e.X >= sourceField.TWMap.Width || e.Y < 0 || e.Y >= sourceField.TWMap.Height {
		return nil, fmt.Errorf("Position out of bounds")
	}
	// check if tower is already built
	if sourceField.TWMap.IsOccupied(e.X, e.Y) {
		return nil, fmt.Errorf("Position already occupied")
	}
	// Get TowerType from gameConfig
	towerType := gc.TowerType(e.TowerType)
	if towerType == nil {
		return nil, fmt.Errorf("Invalid tower type %s", e.TowerType)
	}
	towerLevel := towerType.Level(1)
	if towerLevel == nil {
		return nil, fmt.Errorf("Invalid tower level %d", 1)
	}
	// Check if player can affort tower
	if sourceField.Player.Money < towerLevel.Cost*100 {
		return nil, fmt.Errorf("Player cannot afford tower")
	}
	tower := towerType.Tower(float64(e.X)*TileSize+TileSize/2, float64(e.Y)*TileSize+TileSize/2, 1)
	//Occupy tower position in twmap
	sourceField.TWMap.Occupy(e.X, e.Y)
	sourceField.Towers = append(sourceField.Towers, tower)
	sourceField.Player.Money -= towerLevel.Cost * 100
	return []*GameEvent{
		{
			Type: "towerCreated",
			Payload: TowerCreatedEvent{
				FieldId: sourceField.Id,
				Tower:   tower,
			},
		},
		{
			Type: "playerUpdated",
			Payload: PlayerUpdatedEvent{
				FieldId: sourceField.Id,
				Player:  sourceField.Player,
			},
		},
	}, nil
}

func (e BuildEvent) FieldId() int {
	return e.fieldId
}

func (e BuildEvent) TargetFieldIds() []int {
	return []int{}
}

func (e BuildEvent) ToJson() string {
	// encode e using json.Marshal
	json, _ := json.Marshal(e)
	return string(json)
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
	TargetFieldId int    `json:"targetFieldId"`
	MobType       string `json:"mobType"`
}

func NewBuyMobEvent(fieldId int) BuyMobEvent {
	return BuyMobEvent{fieldId: fieldId}
}

// implement Event for BuyMobEvent
func (e BuyMobEvent) TryExecute(sourceField *Field, targetFields []*Field, config *GameConfig) ([]*GameEvent, error) {
	// Debuglog event
	fmt.Printf("BuyMobEvent: %+v\n", e)
	// Check if player can afford mob
	mobType := config.MobType(e.MobType)
	if mobType == nil {
		// Invalid mob type
		fmt.Println("Invalid mob type")
		return nil, fmt.Errorf("Invalid mob type")
	}
	if sourceField.Player.Money < mobType.Cost*100 {
		// Player cannot afford mob
		fmt.Println("Player cannot afford mob")
		return nil, fmt.Errorf("Player cannot afford mob")
	}
	// Reduce player money
	sourceField.Player.Money -= mobType.Cost * 100
	// Increase player income
	sourceField.Player.Income += mobType.Income
	gameEvents := []*GameEvent{}
	// range over targetFields and add mob to all of them
	for _, targetField := range targetFields {
		//Get startposition
		startX, startY := targetField.TWMap.StartPosition()
		mobId := targetField.getNextMobId()
		mob := mobType.Mob(float64(startX)*TileSize+TileSize/2, float64(startY)*TileSize+TileSize/2, mobId)
		targetField.Mobs = append(targetField.Mobs, mob)
		gameEvents = append(gameEvents, &GameEvent{
			Type: "mobCreated",
			Payload: MobCreatedEvent{
				FieldId: targetField.Id,
				Mob:     mob,
			},
		})
	}
	// Send playerUpdated event
	gameEvents = append(gameEvents, &GameEvent{
		Type: "playerUpdated",
		Payload: PlayerUpdatedEvent{
			FieldId: sourceField.Id,
			Player:  sourceField.Player,
		},
	})
	return gameEvents, nil
}

func (e BuyMobEvent) FieldId() int {
	return e.fieldId
}

func (e BuyMobEvent) TargetFieldIds() []int {
	return []int{e.TargetFieldId}
}

func (e BuyMobEvent) ToJson() string {
	// encode e using json.Marshal
	json, _ := json.Marshal(e)
	return string(json)
}
