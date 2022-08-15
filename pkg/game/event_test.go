package game

import (
	"testing"
)

// Test that BuildEvent gets correctly unpacked from FieldEvent
func TestBuildEvent(t *testing.T) {
	event := FieldEvent{
		FieldId: 0,
		Type:    "build",
		Payload: `{"x":1,"y":1,"towerType":"tower_1"}`,
	}
	unpackedEvent := event.Unpack()
	if unpackedEvent == nil {
		t.Errorf("Expected event to be unpacked")
	}
	// Check that buildEvent is of Type BuildEvent
	buildEvent, ok := unpackedEvent.(BuildEvent)
	if !ok {
		t.Errorf("Expected BuildEvent, got %T", unpackedEvent)
	}
	if buildEvent.FieldId() != 0 {
		t.Errorf("Expected FieldId to be 0, got %d", buildEvent.FieldId())
	}
	if buildEvent.X != 1 {
		t.Errorf("Expected X to be 0, got %d", buildEvent.X)
	}
	if buildEvent.Y != 1 {
		t.Errorf("Expected Y to be 0, got %d", buildEvent.Y)
	}
	if buildEvent.TowerType != "tower_1" {
		t.Errorf("Expected TowerType to be tower_1, got %s", buildEvent.TowerType)
	}
}

// Test that BuyMobEvent gets correctly unpacked from FieldEvent
func TestUnpackBuyMobEvent(t *testing.T) {
	event := FieldEvent{
		FieldId: 0,
		Type:    "buy_mob",
		Payload: `{"targetFieldId": 1, "mobType":"mob_1"}`,
	}
	unpackedEvent := event.Unpack()
	if unpackedEvent == nil {
		t.Errorf("Expected event to be unpacked")
	}
	// Check that buyMobEvent is of Type BuyMobEvent
	buyMobEvent, ok := unpackedEvent.(BuyMobEvent)
	if !ok {
		t.Errorf("Expected BuyMobEvent, got %T", unpackedEvent)
	}
	if buyMobEvent.FieldId() != 0 {
		t.Errorf("Expected FieldId to be 0, got %d", buyMobEvent.FieldId())
	}
	if buyMobEvent.MobType != "mob_1" {
		t.Errorf("Expected MobType to be mob_1, got %s", buyMobEvent.MobType)
	}
	if buyMobEvent.TargetFieldId != 1 {
		t.Errorf("Expected TargetFieldId to be 1, got %d", buyMobEvent.TargetFieldId)
	}
}
