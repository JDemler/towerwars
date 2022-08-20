package game

import (
	"fmt"
	"math/rand"
	"time"
)

type Field struct {
	Id            int       `json:"id"`
	Key           string    `json:"-"`
	Player        *Player   `json:"player"`
	TWMap         *TWMap    `json:"twmap"`
	Mobs          []*Mob    `json:"mobs"`
	Bullets       []*Bullet `json:"bullets"`
	Towers        []*Tower  `json:"towers"`
	mobCounter    int       `json:"-"` // counter for mob ids
	bulletCounter int       `json:"-"` // counter for bullet ids
	towerCounter  int       `json:"-"` // counter for tower ids
}

func randomString(length int) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, length)
	rand.Read(b)
	return fmt.Sprintf("%x", b)[:length]
}

func NewField(id int, player *Player, twmap *TWMap) *Field {
	// Generate a random key for the field
	key := randomString(16)
	return &Field{
		Id:            id,
		Key:           key,
		Player:        player,
		TWMap:         twmap,
		Mobs:          []*Mob{},
		Bullets:       []*Bullet{},
		Towers:        []*Tower{},
		mobCounter:    0,
		bulletCounter: 0,
		towerCounter:  0,
	}
}

// GetTowerById returns a tower by its id
func (f *Field) GetTowerById(id int) *Tower {
	for _, t := range f.Towers {
		if t.Id == id {
			return t
		}
	}
	return nil
}

// remove tower by id
func (field *Field) removeTowerById(id int) {
	for i, t := range field.Towers {
		if t.Id == id {
			field.Towers = append(field.Towers[:i], field.Towers[i+1:]...)
			return
		}
	}
}

// HandleEvent for field
func (field *Field) HandleEvent(event Event, otherFields []*Field, gameConfig *GameConfig) ([]*GameEvent, error) {
	// Iterate over event targetfieldids and get targetfields
	targetFields := []*Field{}
	for _, targetFieldId := range event.TargetFieldIds() {
		for _, otherField := range otherFields {
			if otherField.Id == targetFieldId {
				targetFields = append(targetFields, otherField)
			}
		}
	}
	events, err := event.TryExecute(field, targetFields, gameConfig)
	if err != nil {
		//Log failure to execute event
		fmt.Printf("Failed to execute event: %+v\n", event)
		return []*GameEvent{}, err
	}
	return events, nil
}

func (field *Field) Update(delta float64) []*GameEvent {
	events := []*GameEvent{}
	playerUpdated := false
	// Update Towers
	for i := 0; i < len(field.Towers); i++ {
		bullets := field.Towers[i].Update(delta, field.Mobs, field.getNextBulletId)
		// Add bullets to field
		field.Bullets = append(field.Bullets, bullets...)
		// For every bullet create an event
		for _, bullet := range bullets {
			events = append(events, &GameEvent{
				Type: "bulletCreated",
				Payload: BulletCreatedEvent{
					FieldId: field.Id,
					Bullet:  bullet,
				},
			})
		}
	}

	// Update bullets and remove irrelevant bullets from the game
	for i := len(field.Bullets) - 1; i >= 0; i-- {
		if !field.Bullets[i].Update(delta) || field.Bullets[i].Target.IsDead() {
			// Create BulletDestroyedEvent
			events = append(events, &GameEvent{
				Type: "bulletDestroyed",
				Payload: BulletDestroyedEvent{
					FieldId:  field.Id,
					BulletId: field.Bullets[i].Id,
				},
			})
			// Remove bullet from field
			field.Bullets = append(field.Bullets[:i], field.Bullets[i+1:]...)

		}
	}
	// Update mobs
	for i := len(field.Mobs) - 1; i >= 0; i-- {
		mobEvents := field.Mobs[i].Update(delta, field.TWMap, field.Id)
		// Add events to events
		events = append(events, mobEvents...)
		// Check if mobs health is 0 or less, remove mob from game and payout player money
		if field.Mobs[i].Health <= 0 {
			field.Player.Money += field.Mobs[i].Reward
			playerUpdated = true
			// Create MobDestroyedEvent
			events = append(events, &GameEvent{
				Type: "mobDestroyed",
				Payload: MobDestroyedEvent{
					FieldId: field.Id,
					MobId:   field.Mobs[i].Id,
				},
			})
			field.Mobs = append(field.Mobs[:i], field.Mobs[i+1:]...)
		} else if field.Mobs[i].Reached {
			// Check if mob has reached the end of the map, remove mob from game and reduce liver of player
			field.Player.Lives -= 1
			playerUpdated = true
			// Create MobDestroyedEvent
			events = append(events, &GameEvent{
				Type: "mobDestroyed",
				Payload: MobDestroyedEvent{
					FieldId: field.Id,
					MobId:   field.Mobs[i].Id,
				},
			})
			field.Mobs = append(field.Mobs[:i], field.Mobs[i+1:]...)
		}
	}
	// If player has been updated, create PlayerUpdatedEvent
	if playerUpdated {
		events = append(events, &GameEvent{
			Type: "playerUpdated",
			Payload: PlayerUpdatedEvent{
				FieldId: field.Id,
				Player:  field.Player,
			},
		})
	}
	return events
}

func (field *Field) getNextMobId() int {
	field.mobCounter++
	return field.mobCounter
}

func (field *Field) getNextBulletId() int {
	field.bulletCounter++
	return field.bulletCounter
}

func (field *Field) getNextTowerId() int {
	field.towerCounter++
	return field.towerCounter
}

// payout income to player
func (field *Field) Payout() {
	field.Player.Money += field.Player.Income
}
