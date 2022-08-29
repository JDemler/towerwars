import { TileSize } from "../config";
import { MobType } from "../data/gameConfig";

export class MobButtonDescription extends Phaser.GameObjects.GameObject {
    //properties
    // Text field of mobName
    mobName: Phaser.GameObjects.Text;
    //mobDescription: Phaser.GameObjects.Text;
    mobCost: Phaser.GameObjects.Text;
    mobIncome: Phaser.GameObjects.Text;
    mobHealth: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, mob: MobType) {
        super(scene, 'MobButtonDescription');
        this.mobName = scene.add.text(TileSize, window.innerHeight - 4 * TileSize, mob.name, { fontFamily: 'Arial', fontSize: '24px', color: '#FFF' });
        //this.mobDescription = scene.add.text(0, 625, mob.description);
        this.mobCost = scene.add.text(TileSize, window.innerHeight - 3 * TileSize, "Cost: " + mob.cost);
        this.mobIncome = scene.add.text(TileSize, window.innerHeight - 2.5 * TileSize, "Income: " + mob.income);
        this.mobHealth = scene.add.text(TileSize, window.innerHeight - 2 * TileSize, "Health: " + mob.health);
    }

    setToMobType(mob: MobType): void {
        this.mobName.setText(mob.name);
        //this.mobDescription.setText(mob.description);
        this.mobCost.setText("Cost: " + mob.cost);
        this.mobIncome.setText("Income: " + mob.income / 100);
        this.mobHealth.setText("Health: " + mob.health);
    }
}