package game

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)

// Field represents a field. Contains its player, map, mobs, bullets and towers
type Field struct {
	ID            int       `json:"id"`
	Key           string    `json:"-"`
	SocialNetwork string    `json:"socialNetwork"`
	Player        *Player   `json:"player"`
	TWMap         *TWMap    `json:"twmap"`
	Mobs          []*Mob    `json:"mobs"`
	Bullets       []*Bullet `json:"bullets"`
	Towers        []*Tower  `json:"towers"`
	Barracks      *Barracks `json:"barracks"`
	mobCounter    int       `json:"-"` // counter for mob ids
	bulletCounter int       `json:"-"` // counter for bullet ids
	towerCounter  int       `json:"-"` // counter for tower ids
}

// Implement Crud interface for Player
func (f *Field) getID() int {
	return f.ID
}

func (f *Field) getType() string {
	return "field"
}

func randomString(length int) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, length)
	rand.Read(b)
	return fmt.Sprintf("%x", b)[:length]
}

// NewField creates a new field from a map, player and id
func NewField(id int, race string, player *Player, barracks *Barracks, twmap *TWMap) *Field {
	// Generate a random key for the field
	key := randomString(16)
	return &Field{
		ID:            id,
		Key:           key,
		SocialNetwork: race,
		Player:        player,
		TWMap:         twmap,
		Mobs:          []*Mob{},
		Bullets:       []*Bullet{},
		Towers:        []*Tower{},
		Barracks:      barracks,
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

func (f *Field) applySplashDamage(bullet *Bullet) {
	for _, mob := range f.Mobs {
		if mob.ID == bullet.Target.ID {
			continue
		}
		dx := mob.X - bullet.X
		dy := mob.Y - bullet.Y
		dist := math.Sqrt(dx*dx + dy*dy)
		if dist <= bullet.SplashRadius {
			mob.Health -= float64(bullet.Damage) * bullet.SplashDmg
		}
	}
}

func (f *Field) applyEffect(bullet *Bullet) {
	if bullet.SplashRadius > 0 {
		for _, mob := range f.Mobs {
			dx := mob.X - bullet.X
			dy := mob.Y - bullet.Y
			dist := math.Sqrt(dx*dx + dy*dy)
			if dist <= bullet.SplashRadius {
				mob.applyEffect(*bullet.Effect)
			}
		}
	} else {
		bullet.Target.applyEffect(*bullet.Effect)
	}
}

func findNextField(id int, fs []*Field) *Field {
	for i, field := range fs {
		if field.ID == id {
			return fs[(i+1)%len(fs)]
		}
	}
	return nil
}

// HandleEvent for field
func (f *Field) HandleEvent(event Event, otherFields []*Field, gameConfig *Config) ([]*ServerEvent, error) {

	events, err := event.TryExecute(f, findNextField(f.ID, otherFields), gameConfig)
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
	// Update barracks
	if f.Barracks.update(delta) {
		events = append(events, updateEvent(f.Barracks, f.ID))
	}

	// Update Towers
	for i := 0; i < len(f.Towers); i++ {
		bullets := f.Towers[i].Update(delta, f.Mobs, f.getNextBulletID)
		// Add bullets to field
		f.Bullets = append(f.Bullets, bullets...)
		// For every bullet create an event
		for _, bullet := range bullets {
			events = append(events, createEvent(bullet, f.ID))
		}
	}

	// Update bullets and remove irrelevant bullets from the game
	for i := len(f.Bullets) - 1; i >= 0; i-- {
		if !f.Bullets[i].update(delta, f) || f.Bullets[i].Target.isDead() {
			// Create BulletDestroyedEvent
			events = append(events, deleteEvent(f.Bullets[i], f.ID))
			// Remove bullet from field
			f.Bullets = append(f.Bullets[:i], f.Bullets[i+1:]...)
		}
	}
	// Update mobs
	for i := len(f.Mobs) - 1; i >= 0; i-- {
		mobEvents := f.Mobs[i].update(delta, f.TWMap, f.ID)
		// Add events to events
		events = append(events, mobEvents...)
		// Check if mobs health is 0 or less, remove mob from game and payout player money
		if f.Mobs[i].Health <= 0 {
			f.Player.Money += f.Mobs[i].Reward
			playerUpdated = true
			// Create MobDestroyedEvent
			events = append(events, deleteEvent(f.Mobs[i], f.ID))
			f.Mobs = append(f.Mobs[:i], f.Mobs[i+1:]...)
		} else if f.Mobs[i].Reached {
			// Create MobDestroyedEvent
			events = append(events, deleteEvent(f.Mobs[i], f.ID))
			// Communicate that live was stolen to the game
			events = append(events, &ServerEvent{
				Type: "liveStolen",
				Payload: liveStolenEvent{
					FieldID: f.ID,
					mob:     *f.Mobs[i],
				},
			})
			f.Mobs = append(f.Mobs[:i], f.Mobs[i+1:]...)
		}
	}
	// If player has been updated, create PlayerUpdatedEvent
	if playerUpdated {
		events = append(events, updateEvent(f.Player, f.ID))
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
