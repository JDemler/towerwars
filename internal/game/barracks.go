package game

import "fmt"

type MobSlot struct {
	MobType string  `json:"mob"`
	Count   int     `json:"count"`
	Respawn float64 `json:"respawn"`
}

type Barracks struct {
	ID     int        `json:"id"`
	race   string     `json:"race"`
	Mobs   []*MobSlot `json:"mobSlots"`
	Config *Config    `json:"-"` // game config
}

func (b *Barracks) getID() int {
	return 0
}

func (b *Barracks) getType() string {
	return "barracks"
}

// New MobSlot
func newMobSlot(mob *MobType) *MobSlot {
	return &MobSlot{MobType: mob.Key, Count: 0, Respawn: float64(mob.Delay)}
}

// New Barracks
func newBarracks(id int, race string, gameConfig *Config) *Barracks {
	mobs := []*MobSlot{}
	for _, m := range gameConfig.getRaceConfigByKey(race).MobTypes {
		mobs = append(mobs, newMobSlot(m))
	}
	return &Barracks{ID: id, Mobs: mobs, race: race, Config: gameConfig}
}

// Update function for MobSlot
func (m *MobSlot) update(delta float64, race string, gameConfig *Config) bool {
	changed := false
	if m.Count > 29 {
		return false
	}
	m.Respawn -= delta
	if m.Respawn <= 0 {
		m.Count++
		MobType := gameConfig.GetMobTypeByKey(race, m.MobType)
		if MobType != nil {
			m.Respawn = float64(MobType.Respawn)
			changed = true
		} else {
			fmt.Printf("Error: MobType %s not found\n", m.MobType)
		}
	}
	return changed
}

// Update function for Barracks
func (b *Barracks) update(delta float64) bool {
	changed := false
	for _, m := range b.Mobs {
		if m.update(delta, b.race, b.Config) {
			changed = true
		}
	}
	return changed
}

// TrySend from MobType
func (b *Barracks) TrySend(m *MobType) bool {
	for _, ms := range b.Mobs {
		if ms.MobType == m.Key {
			if ms.Count > 0 {
				ms.Count--
				return true
			}
		}
	}
	return false
}
