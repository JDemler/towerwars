package game

type MobSlot struct {
	MobType *MobType `json:"mob"`
	Count   int      `json:"count"`
	Respawn float64  `json:"respawn"`
}

type Barracks struct {
	ID   int        `json:"id"`
	Mobs []*MobSlot `json:"mobSlots"`
}

func (b *Barracks) getID() int {
	return 0
}

func (b *Barracks) getType() string {
	return "barracks"
}

// New MobSlot
func newMobSlot(mob *MobType) *MobSlot {
	return &MobSlot{MobType: mob, Count: 0, Respawn: float64(mob.Delay)}
}

// New Barracks
func newBarracks(mobTypes []*MobType) *Barracks {
	mobs := []*MobSlot{}
	for _, m := range mobTypes {
		mobs = append(mobs, newMobSlot(m))
	}
	return &Barracks{ID: 0, Mobs: mobs}
}

// Update function for MobSlot
func (m *MobSlot) update(delta float64) bool {
	changed := false
	if m.Count > 29 {
		return false
	}
	m.Respawn -= delta
	if m.Respawn <= 0 {
		m.Count++
		m.Respawn = float64(m.MobType.Respawn)
		changed = true
	}
	return changed
}

// Update function for Barracks
func (b *Barracks) update(delta float64) bool {
	changed := false
	for _, m := range b.Mobs {
		if m.update(delta) {
			changed = true
		}
	}
	return changed
}

// TrySend from MobType
func (b *Barracks) TrySend(m *MobType) bool {
	for _, ms := range b.Mobs {
		if ms.MobType.Key == m.Key {
			if ms.Count > 0 {
				ms.Count--
				return true
			}
		}
	}
	return false
}
