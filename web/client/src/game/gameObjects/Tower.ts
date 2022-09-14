import { Sprite } from "pixi.js";
import { TowerModel } from "@models";
import { GridSettings } from '@grid';
import { GameObject, IGameObjectProps, Field } from "@gameObjects";

export default class Tower extends GameObject {
    id: number;
    towerModel: TowerModel;

    towerCircle: Sprite;

    constructor(props: IGameObjectProps, field: Field, towerModel: TowerModel) {
        super(props);

        this.id = towerModel.id;
        this.towerModel = towerModel;

        this.towerCircle = this.TowerSprite;

        this.towerCircle.width = GridSettings.tileSize * 0.7;
        this.towerCircle.height = GridSettings.tileSize * 0.7;

        this.towerCircle.anchor.set(0.5, 0.5);
        this.towerCircle.position.set(towerModel.coordinate.tileCenterX, towerModel.coordinate.tileCenterY);
        this.towerCircle.zIndex = 1000;

        field.container.addChild(this.towerCircle);
    }

    get TowerSprite() {
        let imgName: string;
        switch (this.towerModel.type) {
            case 'likeButton':
                imgName = 'like_button';
                break;
            case 'comment':
                imgName = 'comment';
                break;
            case 'profilePicture':
                imgName = 'profile_picture';
                break;
            default:
                imgName = 'likeButton';
                break;
        }
        return Sprite.from(`assets/towerSprites/${imgName}.jpg`);
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
