import { TileSize } from "../config";
import { TowerType } from "../data/gameConfig";
import { Tower } from "../data/tower";
import GameScene from "../scenes/Game";

export class TowerDescription extends Phaser.GameObjects.GameObject {
    //properties
    scene: GameScene;
    // Text field of mobName
    towerName: Phaser.GameObjects.Text;
    //towerDescription: Phaser.GameObjects.Text;

    towerDamage: Phaser.GameObjects.Text;
    towerRange: Phaser.GameObjects.Text;
    towerFireRate: Phaser.GameObjects.Text;

    upgradeButton: Phaser.GameObjects.Text;
    sellButton: Phaser.GameObjects.Text;

    constructor(scene: GameScene, tower: Tower, towerType: TowerType) {
        super(scene, 'TowerMenu');
        this.scene = scene;
        var leftOffset = TileSize;
        this.towerName = scene.add.text(leftOffset, 300, towerType.name, { fontFamily: 'Arial', fontSize: '24px', color: '#FFF' });
        //this.towerDescription = scene.add.text(leftOffset, 325, towerType.description);

        this.towerDamage = scene.add.text(leftOffset, 355, "Damage: " + tower.damage);
        this.towerRange = scene.add.text(leftOffset, 370, "Range: " + tower.range);
        this.towerFireRate = scene.add.text(leftOffset, 385, "Fire Rate: " + tower.fireRate);

        this.upgradeButton = scene.add.text(leftOffset, 400, "Upgrade")
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

        this.sellButton = scene.add.text(leftOffset + 100, 400, "Sell")
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

    setTowerDescription(towerType: TowerType, tower?: Tower): void {
        this.towerName.setText(towerType.name);
        //this.towerDescription.setText(towerType.description);

        if (tower != null) {
            this.towerDamage.setText("Damage: " + tower.damage);
            this.towerRange.setText("Range: " + tower.range);
            this.towerFireRate.setText("Fire Rate: " + tower.fireRate);
        }
    }
}