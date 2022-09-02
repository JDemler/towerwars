import { Application, Graphics, Sprite } from "pixi.js";
import { BulletModel } from "../../models";
import { GridSettings } from '../../lib/GridSettings';
import GridCoordinate from '../../lib/GridCoordinate';
import { GameObject } from "./GameObject";
import { Mob } from "./Mob";
import Field from './Field';

export class Bullet extends GameObject {
    id: number;
    bulletModel: BulletModel;

    bulletCircle: Sprite;
    currentCoordinate: GridCoordinate;

    targetMob: Mob;

    constructor(app: Application, field: Field, bulletModel: BulletModel, targetMob: Mob) {
        super(app);

        this.id = bulletModel.id;
        this.bulletModel = bulletModel;

        this.targetMob = targetMob;

        this.bulletCircle  = Sprite.from('assets/facebook_troll.jpg');

        this.bulletCircle.width = GridSettings.tileSize * 0.3;
        this.bulletCircle.height = GridSettings.tileSize * 0.3;

        this.bulletCircle.anchor.set(0.5, 0.5);
        this.bulletCircle.position.set(bulletModel.coordinate.tileCenterX, bulletModel.coordinate.tileCenterY);
        this.bulletCircle.zIndex = 1000;

        this.currentCoordinate = bulletModel.coordinate;

        field.container.addChild(this.bulletCircle);
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
