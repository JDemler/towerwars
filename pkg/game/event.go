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

type TowerUpgradedEvent struct {
	FieldId int    `json:"fieldId"`
	Tower   *Tower `json:"tower"`
}

type TowerDestroyedEvent struct {
	FieldId int `json:"fieldId"`
	TowerId int `json:"towerId"`
}

type LiveStolenEvent struct {
	FieldId         int `json:"fieldId"`
	SentFromFieldId int `json:"sentFromFieldId"`
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
	Payload Event  `json:"payload"`
}

func (e *FieldEvent) UnmarshalJSON(data []byte) error {
	var f struct {
		FieldId int             `json:"fieldId"`
		Key     string          `json:"key"`
		Type    string          `json:"eventType"`
		Payload json.RawMessage `json:"payload"`
	}
	if err := json.Unmarshal(data, &f); err != nil {
		return err
	}
	e.FieldId = f.FieldId
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
	}
	return nil
}

type Event interface {
	TryExecute(sourceField *Field, targetFields []*Field, gc *GameConfig) ([]*GameEvent, error)
	TargetFieldIds() []int
}

type BuildEvent struct {
	X         int    `json:"x"`
	Y         int    `json:"y"`
	TowerType string `json:"towerType"`
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
	tower := towerType.Tower(float64(e.X)*TileSize+TileSize/2, float64(e.Y)*TileSize+TileSize/2, 1, sourceField.getNextTowerId())
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

func (e BuildEvent) TargetFieldIds() []int {
	return []int{}
}

type SellEvent struct {
	TowerId int `json:"towerId"`
}

// implement Event for SellEvent
func (e SellEvent) TryExecute(sourceField *Field, targetFields []*Field, gc *GameConfig) ([]*GameEvent, error) {

	// Check if tower exists
	tower := sourceField.GetTowerById(e.TowerId)
	if tower == nil {
		return nil, fmt.Errorf("Tower %d does not exist", e.TowerId)
	}
	towerType := gc.TowerType(tower.Type)
	sourceField.TWMap.Free(int((tower.X-TileSize/2)/TileSize), int((tower.Y-TileSize/2)/TileSize))
	sourceField.removeTowerById(e.TowerId)
	sourceField.Player.Money += towerType.Level(tower.Level).Cost * 80
	return []*GameEvent{
		{
			Type: "towerDestroyed",
			Payload: TowerDestroyedEvent{
				FieldId: sourceField.Id,
				TowerId: tower.Id,
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

func (e SellEvent) TargetFieldIds() []int {
	return []int{}
}

type UpgradeEvent struct {
	TowerId int `json:"towerId"`
}

// implement Event for UpgradeEvent
func (e UpgradeEvent) TryExecute(sourceField *Field, targetFields []*Field, gc *GameConfig) ([]*GameEvent, error) {
	// Check if tower exists
	tower := sourceField.GetTowerById(e.TowerId)
	if tower == nil {
		return nil, fmt.Errorf("Tower not found")
	}
	// Get TowerType from gameConfig
	towerType := gc.TowerType(tower.Type)
	if towerType == nil {
		return nil, fmt.Errorf("Invalid tower type %s", tower.Type)
	}
	towerLevel := towerType.Level(tower.Level + 1)
	if towerLevel == nil {
		return nil, fmt.Errorf("Invalid tower level %d", tower.Level+1)
	}
	// Check if player can affort tower
	if sourceField.Player.Money < towerLevel.Cost*100 {
		return nil, fmt.Errorf("Player cannot afford tower")
	}
	// Upgrade tower
	tower.Upgrade(towerLevel)
	sourceField.Player.Money -= towerLevel.Cost * 100
	return []*GameEvent{
		{
			Type: "towerUpgraded",
			Payload: TowerUpgradedEvent{
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

func (e UpgradeEvent) TargetFieldIds() []int {
	return []int{}
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
		mob.SentFromFieldId = sourceField.Id
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

func (e BuyMobEvent) TargetFieldIds() []int {
	return []int{e.TargetFieldId}
}
