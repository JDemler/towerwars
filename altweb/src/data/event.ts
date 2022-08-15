
type FieldEvent = {
    fieldId: number;
    eventType: string;
    payload: string;
}

type BuildTowerEvent = {
    x: number;
    y: number;
    towerType: string;
}

type BuyMobEvent = {
    targetFieldId: number;
    mobType: string;
}