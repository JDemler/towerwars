import { Application, Sprite } from "pixi.js";
import { MobModel } from "../../models";
import { GridSettings } from '../../lib/GridSettings';
import GridCoordinate from '../../lib/GridCoordinate';
import { GameObject } from "./GameObject";
import Field from './Field';

export class Mob extends GameObject {
    id: number;
    mobModel: MobModel;

    mobCircle: Sprite;
    currentCoordinate: GridCoordinate;

    constructor(app: Application, field: Field, mobModel: MobModel) {
        super(app);

        this.id = mobModel.id;
        this.mobModel = mobModel;

        this.mobCircle = Sprite.from('assets/facebook_troll.jpg');

        this.mobCircle.width = GridSettings.tileSize;
        this.mobCircle.height = GridSettings.tileSize;

        this.mobCircle.anchor.set(0.5, 0.5);

        this.mobCircle.position.set(mobModel.coordinate.tileCenterX, mobModel.coordinate.tileCenterY);

        this.currentCoordinate = mobModel.coordinate;

        console.log(this.mobCircle);

        field.container.addChild(this.mobCircle);

        console.log(field.container.children);
    }

    onUpdate(_: number, deltaMs: number): void {
        // const newPosition = this.currentCoordinate.moveTo(this.mobModel.targetCoordinate, this.mobModel.speed, deltaMs);

        // this.currentCoordinate = newPosition;

        // this.mobCircle.position.set(newPosition.tileCenterX, newPosition.tileCenterY);
    }

    onDestroy(): void {
        this.mobCircle.destroy();
    }

    updateFromModel(mobModel: MobModel) {
        this.mobModel = mobModel;
        console.log("Mob updated", mobModel);
        this.currentCoordinate = this.mobModel.coordinate;
    }
}
