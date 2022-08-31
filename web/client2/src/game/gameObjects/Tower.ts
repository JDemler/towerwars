import { Application, Graphics } from "pixi.js";
import { TowerModel } from "../../models";
import { GridSettings } from '../../lib/GridSettings';
import { GameObject } from "./GameObject";
import Field from './Field';

export class Tower extends GameObject {
    id: number;
    towerModel: TowerModel;

    towerCircle: Graphics;

    constructor(app: Application, field: Field, towerModel: TowerModel) {
        super(app);

        this.id = towerModel.id;
        this.towerModel = towerModel;

        console.log({towerModel, x: towerModel.coordinate.tileCenterX, y: towerModel.coordinate.tileCenterY, rad: GridSettings.tileSize / 2 });
        
        this.towerCircle = new Graphics()
            .beginFill(0x00ff00)
            .drawCircle(towerModel.coordinate.tileCenterX, towerModel.coordinate.tileCenterY, GridSettings.tileSize / 2)
            .endFill()

        field.container.addChild(this.towerCircle);
    }

    onUpdate(delta: number, deltaMs: number): void {
        this.towerCircle.position.set(this.towerModel.coordinate.tileCenterX, this.towerModel.coordinate.tileCenterY);
    }

    onDestroy(): void {
        this.towerCircle.destroy();
    }

    updateFromModel(towerModel: TowerModel) {
        this.towerModel = towerModel;
    }
}
