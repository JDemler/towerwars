import { TowerType } from "../data/gameConfig";
import { Tower } from "../data/tower";
import GameScene from "../scenes/Game";

export class TowerMenu extends Phaser.GameObjects.GameObject {
    //properties
    scene: GameScene;
    // Text field of mobName
    towerName: Phaser.GameObjects.Text;
    towerDescription: Phaser.GameObjects.Text;

    towerDamage: Phaser.GameObjects.Text;
    towerRange: Phaser.GameObjects.Text;
    towerFireRate: Phaser.GameObjects.Text;

    upgradeButton: Phaser.GameObjects.Text;
    sellButton: Phaser.GameObjects.Text;

    towerTypeImages: Phaser.GameObjects.Image[] = [];
    constructor(scene: GameScene, tower: Tower, towerType: TowerType) {
        super(scene, 'TowerMenu');
        this.scene = scene;
        var leftOffset = 145;
        this.towerName = scene.add.text(scene.offsetX - leftOffset, 300, towerType.name, { fontFamily: 'Arial', fontSize: '24px', color: '#FFF' });
        this.towerDescription = scene.add.text(scene.offsetX - leftOffset, 325, towerType.description);

        this.towerDamage = scene.add.text(scene.offsetX - leftOffset, 355, "Damage: " + tower.damage);
        this.towerRange = scene.add.text(scene.offsetX - leftOffset, 370, "Range: " + tower.range);
        this.towerFireRate = scene.add.text(scene.offsetX - leftOffset, 385, "Fire Rate: " + tower.fireRate);

        this.upgradeButton = scene.add.text(scene.offsetX - leftOffset, 400, "Upgrade")
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.websocket?.send(JSON.stringify({
                    fieldId: this.scene.playerId,
                    eventType: "upgradeTower",
                    payload: {
                        towerId: tower.id
                    }
                }));
            });

        this.sellButton = scene.add.text(scene.offsetX - leftOffset + 100, 400, "Sell")
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.websocket?.send(JSON.stringify({
                    fieldId: this.scene.playerId,
                    eventType: "sellTower",
                    payload: {
                        towerId: tower.id
                    }
                }));
            });
    }

    setToTowerType(tower: Tower, towerType: TowerType): void {
        this.towerName.setText(towerType.name);
        this.towerDescription.setText(towerType.description);

        this.towerDamage.setText("Damage: " + tower.damage);
        this.towerRange.setText("Range: " + tower.range);
        this.towerFireRate.setText("Fire Rate: " + tower.fireRate);
    }

    drawTowerTypeImages(): void {
        var postFxPlugin = this.scene.plugins.get('rexoutlinepipelineplugin');
        this.scene.towerTypes.forEach((towerType, index) => {
            var image = this.scene.add.image(this.scene.offsetX + 100, 300 + index * 50, towerType.name);
            image.setInteractive().on('pointerdown', () => {
                this.scene.setTowerType(towerType);
            });
            this.towerTypeImages.push(image);
        });
    }
}