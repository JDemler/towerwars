import { TileSize } from "../config";
import { TowerType, towerTypeToColor } from "../data/gameConfig";
import { Tower } from "../data/tower";
import GameScene from "../scenes/Game";

export class GameTower extends Phaser.GameObjects.GameObject {
    //properties
    id: number;
    tower: Tower;
    towerType: TowerType;
    scene: GameScene;
    rect: Phaser.GameObjects.Rectangle;
    focus: boolean = false;
    constructor(scene: GameScene, tower: Tower, towerType: TowerType) {
        super(scene, 'GameTower');
        this.id = tower.id;
        this.tower = tower;
        this.scene = scene;
        this.towerType = towerType;
        this.rect = this.scene.add.rectangle
            (this.tower.x * TileSize + this.scene.offsetX
                , this.tower.y * TileSize + this.scene.offsetY
                , 10, 10, towerTypeToColor(towerType)).setInteractive()
            .on('pointerdown', () => {
                this.scene.setTowerDescription(this);
            });
    }

    levelToTowerSize(level: number): number {
        return 10 + (level - 1) * 5;
    }

    upgrade(tower: Tower): void {
        var size = this.levelToTowerSize(tower.level);
        var diffsize = this.levelToTowerSize(tower.level) - this.levelToTowerSize(tower.level - 1);
        this.rect.setSize(size, size);
        this.rect.setPosition(tower.x * TileSize + this.scene.offsetX - diffsize, tower.y * TileSize + this.scene.offsetY - diffsize);
        this.tower = tower;

    }

    destroy(): void {
        this.rect.destroy();
    }
}