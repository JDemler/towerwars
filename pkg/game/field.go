package game

import (
	"fmt"
	"math/rand"
	"time"
)

// Field represents a field. Contains its player, map, mobs, bullets and towers
type Field struct {
	ID            int       `json:"id"`
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

// NewField creates a new field from a map, player and id
func NewField(id int, player *Player, twmap *TWMap) *Field {
	// Generate a random key for the field
	key := randomString(16)
	return &Field{
		ID:            id,
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

// GetTowerByID returns a tower by its id
func (f *Field) GetTowerByID(id int) *Tower {
	for _, t := range f.Towers {
		if t.ID == id {
			return t
		}
	}
	return nil
}

// remove tower by id
func (f *Field) removeTowerByID(id int) {
	for i, t := range f.Towers {
		if t.ID == id {
			f.Towers = append(f.Towers[:i], f.Towers[i+1:]...)
			return
		}
	}
}

// HandleEvent for field
func (f *Field) HandleEvent(event Event, otherFields []*Field, gameConfig *Config) ([]*ServerEvent, error) {
	// Iterate over event targetfieldids and get targetfields
	targetFields := []*Field{}
	for _, targetFieldID := range event.TargetFieldIds() {
		for _, otherField := range otherFields {
			if otherField.ID == targetFieldID {
				targetFields = append(targetFields, otherField)
			}
		}
	}
	events, err := event.TryExecute(f, targetFields, gameConfig)
	if err != nil {
		//Log failure to execute event
		fmt.Printf("Failed to execute event: %+v\n", event)
		return []*ServerEvent{}, err
	}
	return events, nil
}

// Update loop for field
func (f *Field) Update(delta float64) []*ServerEvent {
	events := []*ServerEvent{}
	playerUpdated := false
	// Update Towers
	for i := 0; i < len(f.Towers); i++ {
		bullets := f.Towers[i].Update(delta, f.Mobs, f.getNextBulletID)
		// Add bullets to field
		f.Bullets = append(f.Bullets, bullets...)
		// For every bullet create an event
		for _, bullet := range bullets {
			events = append(events, CreateEvent(bullet, f.ID))
		}
	}

	// Update bullets and remove irrelevant bullets from the game
	for i := len(f.Bullets) - 1; i >= 0; i-- {
		if !f.Bullets[i].Update(delta) || f.Bullets[i].Target.IsDead() {
			// Create BulletDestroyedEvent
			events = append(events, DeleteEvent(f.Bullets[i], f.ID))
			// Remove bullet from field
			f.Bullets = append(f.Bullets[:i], f.Bullets[i+1:]...)

		}
	}
	// Update mobs
	for i := len(f.Mobs) - 1; i >= 0; i-- {
		mobEvents := f.Mobs[i].Update(delta, f.TWMap, f.ID)
		// Add events to events
		events = append(events, mobEvents...)
		// Check if mobs health is 0 or less, remove mob from game and payout player money
		if f.Mobs[i].Health <= 0 {
			f.Player.Money += f.Mobs[i].Reward
			playerUpdated = true
			// Create MobDestroyedEvent
			events = append(events, DeleteEvent(f.Mobs[i], f.ID))
			f.Mobs = append(f.Mobs[:i], f.Mobs[i+1:]...)
		} else if f.Mobs[i].Reached {
			// Create MobDestroyedEvent
			events = append(events, DeleteEvent(f.Mobs[i], f.ID))
			// Communicate that live was stolen to the game
			events = append(events, &ServerEvent{
				Type: "liveStolen",
				Payload: liveStolenEvent{
					FieldID:         f.ID,
					SentFromFieldID: f.Mobs[i].SentFromFieldID,
				},
			})
			f.Mobs = append(f.Mobs[:i], f.Mobs[i+1:]...)
		}
	}
	// If player has been updated, create PlayerUpdatedEvent
	if playerUpdated {
		events = append(events, UpdateEvent(f.Player, f.ID))
	}
	return events
}

func (f *Field) getNextMobID() int {
	f.mobCounter++
	return f.mobCounter
}

func (f *Field) getNextBulletID() int {
	f.bulletCounter++
	return f.bulletCounter
}

func (f *Field) getNextTowerID() int {
	f.towerCounter++
	return f.towerCounter
}

// Payout income to player
func (f *Field) Payout() {
	f.Player.Money += f.Player.Income
}
