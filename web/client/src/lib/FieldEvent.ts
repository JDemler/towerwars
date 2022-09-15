import { AddedPlayerModel } from "@models";

export class FieldEvent {
    fieldId: number;
    key: string;
    eventType: string;
    payload: any;

    constructor(player: AddedPlayerModel, eventType: string, payload: any) {
        this.fieldId = player.fieldId;
        this.key = player.key;
        this.eventType = eventType;
        this.payload = payload;
    }
}

export class BuildTurretEvent extends FieldEvent {
    constructor(player: AddedPlayerModel, x: number, y: number, turretType: string) {
        super(player, "buildTower", {
            x: x,
            y: y,
            towerType: turretType,
        });
    }
}

export class BuyMobEvent extends FieldEvent {
    constructor(player: AddedPlayerModel, targetFieldId: number, mobType: string) {
        super(player, "buyMob", {
            targetFieldId: targetFieldId,
            mobType: mobType,
        });
    }
}

export class UpgradeTowerEvent extends FieldEvent {
    constructor(player: AddedPlayerModel, towerId: number) {
        super(player, "upgradeTower", {
            towerId: towerId,
        });
    }
}

export class SellTowerEvent extends FieldEvent {
    constructor(player: AddedPlayerModel, towerId: number) {
        super(player, "sellTower", {
            towerId: towerId,
        });
    }
}