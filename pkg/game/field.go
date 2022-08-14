package game

import "fmt"

type Field struct {
	Id      int
	Player  *Player
	TWMap   *TWMap
	Mobs    []*Mob
	Bullets []*Bullet
	Towers  []*Tower
}

func NewField(id int, player *Player, twmap *TWMap) *Field {
	return &Field{
		Id:      id,
		Player:  player,
		TWMap:   twmap,
		Mobs:    []*Mob{},
		Bullets: []*Bullet{},
		Towers:  []*Tower{},
	}
}

func (field *Field) handleBuildEvent(x, y int) {
	// check if player has enough money
	if field.Player.Money < 1 {
		return
	}
	// check if position within map bounds
	if x < 0 || x >= field.TWMap.Width || y < 0 || y >= field.TWMap.Height {
		return
	}
	// check if position is already occupied
	if field.TWMap.IsOccupied(x, y) {
		return
	}
	field.Player.Money -= 1
	field.TWMap.Occupy(x, y)
	field.Towers = append(field.Towers, &Tower{X: float64(x)*TileSize + TileSize/2, Y: float64(y)*TileSize + TileSize/2, Damage: 1, Range: 500, FireRate: 0.3, Cooldown: 0})
}

// HandleEvent for field
func (field *Field) HandleEvent(event Event, otherFields []*Field, gc *GameConfig) bool {
	// Iterate over event targetfieldids and get targetfields
	targetFields := []*Field{}
	for _, targetFieldId := range event.TargetFieldIds() {
		for _, otherField := range otherFields {
			if otherField.Id == targetFieldId {
				targetFields = append(targetFields, otherField)
			}
		}
	}

	if !event.TryExecute(field, targetFields, gc) {
		//Log failure to execute event
		fmt.Printf("Failed to execute event: %+v", event)
		return false
	}
	return true
}

func (field *Field) Update(delta float64) {

	// Update Towers
	for i := 0; i < len(field.Towers); i++ {
		bullets := field.Towers[i].Update(delta, field.Mobs)
		field.Bullets = append(field.Bullets, bullets...)
	}

	// Update bullets and remove irrelevant bullets from the game
	for i := len(field.Bullets) - 1; i >= 0; i-- {
		if !field.Bullets[i].Update(delta) || field.Bullets[i].Target.IsDead() {
			field.Bullets = append(field.Bullets[:i], field.Bullets[i+1:]...)
		}
	}
	// Update mobs
	for i := len(field.Mobs) - 1; i >= 0; i-- {
		field.Mobs[i].Update(delta, field.TWMap)
		// Check if mobs health is 0 or less, remove mob from game and payout player money
		if field.Mobs[i].Health <= 0 {
			field.Player.Money += field.Mobs[i].Reward
			field.Mobs = append(field.Mobs[:i], field.Mobs[i+1:]...)
		} else if field.Mobs[i].Reached {
			// Check if mob has reached the end of the map, remove mob from game and reduce liver of player
			field.Player.Lives -= 1
			field.Mobs = append(field.Mobs[:i], field.Mobs[i+1:]...)
		}
	}
}

// payout income to player
func (field *Field) Payout() {
	field.Player.Money += field.Player.Income
}
