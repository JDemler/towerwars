import { Container, Sprite } from "pixi.js";
import { MobModel } from "@models";
import { GridSettings, GridCoordinate } from '@grid';
import { GameObject, Field, Healthbar, IGameObjectProps } from "@gameObjects";

export default class Mob extends GameObject {
    id: number;
    mobModel: MobModel;

    mobContainer: Container;
    mobCircle: Sprite;
    currentCoordinate: GridCoordinate;

    get healthbar() {
        return this.getChild(Healthbar)!;
    }

    constructor(props: IGameObjectProps, field: Field, mobModel: MobModel) {
        super(props);

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
        const healthbar = new Healthbar(this.props, mobModel.health, mobModel.maxHealth);
        healthbar.outerHealthBarGraphics.position.y = GridSettings.tileSize * -0.5;

        this.mobContainer.addChild(healthbar.outerHealthBarGraphics);
        this.children.push(healthbar);

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

        this.currentCoordinate = this.mobModel.coordinate;
        
        this.healthbar.updateHealth(mobModel.health, mobModel.maxHealth);
    }
}
