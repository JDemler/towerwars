package game

import "fmt"

type MobSlot struct {
	MobType string  `json:"mob"`
	Count   int     `json:"count"`
	Max     int     `json:"max"`
	Level   int     `json:"level"`
	Respawn float64 `json:"respawn"`
}

type Barracks struct {
	ID     int        `json:"id"`
	race   string     `json:"-"`
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
	return &MobSlot{MobType: mob.Key, Count: 0, Max: mob.MaxStock, Respawn: float64(mob.Delay), Level: 0}
}

// New Barracks
func newBarracks(id int, network string, gameConfig *Config) *Barracks {
	mobs := []*MobSlot{}
	// get mobTypes
	config := gameConfig.getRaceConfigByKey(network)
	if config != nil {
		for _, mob := range config.MobTypes {
			mobs = append(mobs, newMobSlot(mob))
		}
	} else {
		fmt.Printf("Error: RaceConfig %s not found\n", network)
	}
	return &Barracks{ID: id, Mobs: mobs, race: network, Config: gameConfig}
}

// Update function for MobSlot
func (m *MobSlot) update(delta float64, race string, gameConfig *Config) bool {
	changed := false
	if m.Count >= m.Max {
		return false
	}
	m.Respawn -= delta
	if m.Respawn <= 0 {
		m.Count++
		MobType := gameConfig.GetMobTypeByKey(race, m.MobType, m.Level)
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

func (b *Barracks) LevelUpMobType(mobType MobType) {
	//Debug log
	fmt.Printf("Barracks %d: LevelUpMobType %s\n", b.ID, mobType.Key)
	for _, m := range b.Mobs {
		if m.MobType == mobType.Key {
			m.Level++
			m.Count = 0
			m.Respawn = float64(mobType.Delay)
		}
	}
}

// TrySend from MobType
func (b *Barracks) TrySend(mTypeKey string) (bool, int) {
	for _, ms := range b.Mobs {
		if ms.MobType == mTypeKey {
			if ms.Count > 0 {
				ms.Count--
				return true, ms.Level
			}
		}
	}
	return false, 0
}

func (b *Barracks) GetMobTypeLevel(mTypeKey string) int {
	for _, ms := range b.Mobs {
		if ms.MobType == mTypeKey {
			return ms.Level
		}
	}
	return 0
}
