import { Container, Sprite, Text, Graphics } from 'pixi.js';
import { TowerModel } from "@models";
import { GridSettings } from '@grid';
import { GameObject, IGameObjectProps, Field } from "@gameObjects";

export default class Tower extends GameObject {
    id: number;
    towerModel: TowerModel;

    towerContainer: Container;
    towerSelectionBackground: Graphics;
    towerCircle: Sprite;
    levelLabel: Text;

    constructor(props: IGameObjectProps, field: Field, towerModel: TowerModel) {
        super(props);

        this.id = towerModel.id;
        this.towerModel = towerModel;

        this.towerContainer = new Container();
        this.towerContainer.pivot.set(0.5, 0.5);
        this.towerContainer.zIndex = 1000;
        this.towerContainer.position.set(towerModel.coordinate.tileCenterX, towerModel.coordinate.tileCenterY);

        this.towerSelectionBackground = new Graphics()
            .beginFill(0x000000, 0.4)
            .drawRect(0, 0, 1, 1)
            .endFill();
        this.towerSelectionBackground.width = GridSettings.tileSize * 0.85;
        this.towerSelectionBackground.height = GridSettings.tileSize * 0.85;
        this.towerSelectionBackground.pivot.set(0.5, 0.5);
        this.towerSelectionBackground.visible = false;

        this.towerCircle = this.TowerSprite;
        this.towerCircle.width = GridSettings.tileSize * 0.7;
        this.towerCircle.height = GridSettings.tileSize * 0.7;
        this.towerCircle.anchor.set(0.5, 0.5);

        this.levelLabel = new Text('', {
            fontSize: 14,
            fontWeight: "bold",
            fill: "orange",
        });
        this.levelLabel.pivot.set(0.5, 0.5);
        this.updateLevelLabel();

        this.towerContainer.addChild(this.towerSelectionBackground);
        this.towerContainer.addChild(this.towerCircle);
        this.towerContainer.addChild(this.levelLabel);

        field.container.addChild(this.towerContainer);
    }

    get TowerSprite() {
        let imgName: string;
        return Sprite.from(`assets/towerSprites/${this.towerModel.type}.png`);
    }

    onUpdate(delta: number, deltaMs: number): void {
        this.towerSelectionBackground.visible = this.gameInfo.selectedTowerId === this.id;
    }

    updateLevelLabel() {
        this.levelLabel.text = this.towerModel.level.toString();
    }

    onDestroy(): void {
        this.towerContainer.destroy();
    }

    updateFromModel(towerModel: TowerModel) {
        this.towerModel = towerModel;
        
        this.updateLevelLabel();
    }
}
