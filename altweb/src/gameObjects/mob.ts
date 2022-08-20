import { Mob } from "../data/mob";
import GameScene from "../scenes/Game";

export class GameMob extends Phaser.GameObjects.GameObject {
    //properties
    id: number;
    mob: Mob;
    arc: Phaser.GameObjects.Arc;
    scene: GameScene;
    constructor(scene: GameScene, mob: Mob) {
        super(scene, 'GameMob');
        this.id = mob.id;
        this.mob = mob;
        this.scene = scene;
        this.arc = scene.add.circle
            (this.mob.x + scene.offsetX
                , this.mob.y + scene.offsetY
                , 10
                , 0x00ff00);
        this.arc = scene.physics.add.existing(this.arc, false);
        scene.physics.moveTo
            (this.arc
                , mob.targetX + scene.offsetX
                , mob.targetY + scene.offsetY
                , mob.speed);
    }

    updateFromMob(mob: Mob) {
        this.mob = mob;
        this.arc.setPosition(mob.x + this.scene.offsetX, mob.y + this.scene.offsetY);
        this.scene.physics.moveTo
            (this.arc
                , this.mob.targetX + this.scene.offsetX
                , this.mob.targetY + this.scene.offsetY
                , this.mob.speed);
        // FillColor from health/maxhealth (green to red)
        let health = this.mob.health;
        let maxHealth = this.mob.maxHealth;
        let healthPercentage = health / maxHealth;
        let red = Math.floor(255 * (1 - healthPercentage));
        let green = Math.floor(255 * healthPercentage);
        this.arc.setFillStyle(Phaser.Display.Color.GetColor(red, green, 0));
    }

    destroy() {
        this.arc.destroy();
    }
}
