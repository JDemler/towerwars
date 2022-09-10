import { Application, Sprite } from "pixi.js";
import { TowerModel } from "@models";
import { GridSettings } from '@grid';
import { GameObject, Field } from "@gameObjects";

export default class Tower extends GameObject {
    id: number;
    towerModel: TowerModel;

    towerCircle: Sprite;

    constructor(app: Application, field: Field, towerModel: TowerModel) {
        super(app);

        this.id = towerModel.id;
        this.towerModel = towerModel;

        this.towerCircle = Sprite.from('assets/facebook_troll.jpg');

        this.towerCircle.width = GridSettings.tileSize * 0.7;
        this.towerCircle.height = GridSettings.tileSize * 0.7;

        this.towerCircle.anchor.set(0.5, 0.5);
        this.towerCircle.position.set(towerModel.coordinate.tileCenterX, towerModel.coordinate.tileCenterY);
        this.towerCircle.zIndex = 1000;

        
        // this.towerCircle.interactive = true;
        // this.towerCircle.on('pointerdown', e => {
        //     console.log(`Tile clicked`);
        // })

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
