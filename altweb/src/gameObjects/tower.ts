import { Tower } from "../data/tower";
import GameScene from "../scenes/Game";

export class GameTower extends Phaser.GameObjects.GameObject {
    //properties
    id: number;
    tower: Tower;
    scene: GameScene;
    rect: Phaser.GameObjects.Rectangle;
    constructor(scene: GameScene, tower: Tower) {
        super(scene, 'GameTower');
        this.id = tower.id;
        this.tower = tower;
        this.scene = scene;
        this.rect = this.scene.add.rectangle
            (this.tower.x + this.scene.offsetX
                , this.tower.y + this.scene.offsetY
                , 10, 10, 0x0000ff);
    }
}