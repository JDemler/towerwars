export class FieldEvent {
    fieldId: number;
    eventType: string;
    payload: any;

    constructor(fieldId: number, eventType: string, payload: any) {
        this.fieldId = fieldId;
        this.eventType = eventType;
        this.payload = JSON.stringify(payload);
    }
}

export type TurretType = 'Arrow';

export class BuildTurretEvent extends FieldEvent {
    constructor(fieldId: number, x: number, y: number, turretType: TurretType) {
        super(fieldId, "buildTower", {
            x: x,
            y: y,
            towerType: turretType,
        });
    }
}

export type MobType = 'Circle';

export class BuyMobEvent extends FieldEvent {
    constructor(fieldId: number, targetFieldId: number, mobType: MobType) {
        super(fieldId, "buyMob", {
            fieldId: fieldId,
            targetFieldId: targetFieldId,
            mobType: mobType,
        });
    }
}