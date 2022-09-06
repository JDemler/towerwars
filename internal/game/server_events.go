package game

type CrudObject interface {
	getID() int
	getType() string
}

func createEvent(co CrudObject, fieldID int) *ServerEvent {
	return &ServerEvent{
		Type:    co.getType(),
		Kind:    "create",
		FieldID: fieldID,
		Payload: &co,
	}
}

func updateEvent(co CrudObject, fieldID int) *ServerEvent {
	return &ServerEvent{
		Type:    co.getType(),
		Kind:    "update",
		FieldID: fieldID,
		Payload: &co,
	}
}

func deleteEvent(co CrudObject, fieldID int) *ServerEvent {
	return &ServerEvent{
		Type:    co.getType(),
		Kind:    "delete",
		FieldID: fieldID,
		Payload: co.getID(),
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
