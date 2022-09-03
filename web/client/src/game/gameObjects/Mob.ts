import { Application, Container, Sprite } from "pixi.js";
import { MobModel } from "../../models";
import { GridSettings } from '../../lib/GridSettings';
import GridCoordinate from '../../lib/GridCoordinate';
import { GameObject } from "./GameObject";
import Field from './Field';
import { Healthbar } from "./Healthbar";

export class Mob extends GameObject {
    id: number;
    mobModel: MobModel;

    mobContainer: Container;
    mobCircle: Sprite;
    currentCoordinate: GridCoordinate;

    healthbar: Healthbar;

    constructor(app: Application, field: Field, mobModel: MobModel) {
        super(app);

        this.id = mobModel.id;
        this.mobModel = mobModel;
        
        this.currentCoordinate = mobModel.coordinate;

        // Mob Container
        this.mobContainer = new Container();

        this.mobContainer.position.set(mobModel.coordinate.tileCenterX, mobModel.coordinate.tileCenterY);
        this.mobContainer.zIndex = 1;

        // Mob Sprite
        this.mobCircle = Sprite.from('assets/facebook_troll.jpg');

        this.mobCircle.anchor.set(0.5, 0.5);

        this.mobCircle.width = GridSettings.tileSize * 0.7;
        this.mobCircle.height = GridSettings.tileSize * 0.7;

        this.mobContainer.addChild(this.mobCircle);

        // Healthbar
        this.healthbar = new Healthbar(app, field, mobModel.health, mobModel.maxHealth);
        this.healthbar.outerHealthBarGraphics.position.y = GridSettings.tileSize * -0.5;

        this.mobContainer.addChild(this.healthbar.outerHealthBarGraphics);

        // Others
        field.container.addChild(this.mobContainer);
    }

    onUpdate(_: number, deltaMs: number): void {
        const newPosition = this.currentCoordinate.moveTo(this.mobModel.targetCoordinate, this.mobModel.speed, deltaMs);

        this.currentCoordinate = newPosition;

        this.mobContainer.position.set(newPosition.tileCenterX, newPosition.tileCenterY);
    }

    onDestroy(): void {
        this.mobContainer.destroy();
    }

    updateFromModel(mobModel: MobModel) {
        this.mobModel = mobModel;
        console.log("Mob updated", mobModel);
        this.currentCoordinate = this.mobModel.coordinate;

        this.healthbar.updateHealth(mobModel.health, mobModel.maxHealth);
    }
}
