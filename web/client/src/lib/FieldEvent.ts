export class FieldEvent {
    FieldId: number;
    Type: string;
    Payload: any;

    constructor(FieldId: number, Type: string, Payload: any) {
        this.FieldId = FieldId;
        this.Type = Type;
        this.Payload = JSON.stringify(Payload);
    }
}

export type TurretType = 'Arrow';

export class BuildTurretEvent extends FieldEvent {
    constructor(fieldId: number, x: number, y: number, turretType: TurretType) {
        super(fieldId, "build", {
            x: x,
            y: y,
            tower_type: turretType,
        });
    }
}

export type MobType = 'Circle';

export class BuyMobEvent extends FieldEvent {
    constructor(fieldId: number, targetFieldId: number, mobType: MobType) {
        super(fieldId, "buy_mob", {
            target_field_id: targetFieldId,
            mob_type: mobType,
        });
    }
}