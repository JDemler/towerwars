import { Application, Graphics } from "pixi.js";
import { BulletModel } from "../../models";
import { GridSettings } from '../../lib/GridSettings';
import GridCoordinate from '../../lib/GridCoordinate';
import { GameObject } from "./GameObject";
import { Mob } from "./Mob";
import Field from './Field';

export class Bullet extends GameObject {
    id: number;
    bulletModel: BulletModel;

    bulletCircle: Graphics;
    currentCoordinate: GridCoordinate;

    targetMob: Mob;

    constructor(app: Application, field: Field, bulletModel: BulletModel, targetMob: Mob) {
        super(app);

        this.id = bulletModel.id;
        this.bulletModel = bulletModel;

        this.bulletCircle = new Graphics()
            .beginFill(0xffff00)
            .drawCircle(bulletModel.coordinate.tileCenterX, bulletModel.coordinate.tileCenterY, GridSettings.tileSize / 4)
            .endFill();

        this.targetMob = targetMob;

        this.currentCoordinate = bulletModel.coordinate;

        this.app.stage.addChild(this.bulletCircle);
    }

    onUpdate(delta: number, deltaMs: number): void {
        const targetCoordinate = this.targetMob.currentCoordinate;

        const newPosition = this.currentCoordinate.moveTo(targetCoordinate, this.bulletModel.speed, deltaMs);

        this.currentCoordinate = newPosition;

        this.bulletCircle.position.set(newPosition.tileCenterX, newPosition.tileCenterY);
    }

    onDestroy(): void {
        this.bulletCircle.destroy();
    }

    updateFromModel(bulletModel: BulletModel) {
        this.bulletModel = bulletModel;
    }
}
