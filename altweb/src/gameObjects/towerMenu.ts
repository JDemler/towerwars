import { TileSize } from "../config";
import { TowerType } from "../data/gameConfig";
import { Tower } from "../data/tower";
import GameScene from "../scenes/Game";

const towerBtnSize = 4 * TileSize;
const disabledTint = 0x666666;

export class TowerMenu extends Phaser.GameObjects.GameObject {
    //properties
    scene: GameScene;

    selection: number = 0;
    towerTypeImages: Phaser.GameObjects.Image[] = [];
    constructor(scene: GameScene) {
        super(scene, 'TowerMenu');
        this.scene = scene;
        this.drawTowerTypeImages();
    }

    setSelectedTower(index: number): void {
        this.selection = index;
        //Draw orange border around selected tower type
        this.towerTypeImages.forEach((towerTypeImage, i) => {
            if (i == index) {
                towerTypeImage.clearTint();
            } else {
                towerTypeImage.setTint(disabledTint);
            }
        });
    }

    drawTowerTypeImages(): void {
        //var postFxPlugin = this.scene.plugins.get('rexoutlinepipelineplugin');
        this.scene.towerTypes.forEach((towerType, index) => {
            console.log(towerType);
            var button = this.scene.add.image(window.innerWidth / 2, index * towerBtnSize + towerBtnSize / 2 + this.scene.offsetY, towerType.key).setScale(towerBtnSize);
            button.setDisplaySize(towerBtnSize, towerBtnSize);
            let tt = towerType;
            button.setInteractive()
                .on('pointerdown', () => {
                    this.scene.setSelectedTower(index);
                    this.scene.towerDescription?.setTowerDescription(tt);
                })
                .on('pointerover', () => {
                    button.clearTint();
                }).on('pointerout', () => {
                    if (index != this.selection) {
                        button.setTint(disabledTint);
                    } else {
                        button.clearTint();
                    }
                });
            if (index != this.selection) {
                button.setTint(disabledTint);
            }
            this.towerTypeImages.push(button);
        });
    }
}