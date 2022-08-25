package game

type CrudObject interface {
	GetID() int
	GetType() string
}

func CreateEvent(co CrudObject, fieldID int) *ServerEvent {
	return &ServerEvent{
		Type:    co.GetType(),
		Kind:    "create",
		FieldID: fieldID,
		Payload: &co,
	}
}

func UpdateEvent(co CrudObject, fieldID int) *ServerEvent {
	return &ServerEvent{
		Type:    co.GetType(),
		Kind:    "update",
		FieldID: fieldID,
		Payload: &co,
	}
}

func DeleteEvent(co CrudObject, fieldID int) *ServerEvent {
	return &ServerEvent{
		Type:    co.GetType(),
		Kind:    "delete",
		FieldID: fieldID,
		Payload: co.GetID(),
	}
}

// ServerEvent is a generic event that can be sent to the client
type ServerEvent struct {
	Type    string `json:"type"`
	Kind    string `json:"kind"`
	FieldID int    `json:"fieldId"`
	Payload any    `json:"payload"`
}

// GameStateChanged
// LiveStolen

// StateChangedEvent is sent to all players when the gamestate changes
type StateChangedEvent struct {
	GameState string `json:"gameState"`
}

// liveStolenEvent is only used internally to bubble up the liveStolen event to the game loop
type liveStolenEvent struct {
	FieldID         int `json:"fieldId"`
	SentFromFieldID int `json:"sentFromFieldId"`
}
