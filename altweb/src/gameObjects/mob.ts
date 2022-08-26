import { TileSize } from "../config";
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
            (this.mob.x * TileSize + scene.offsetX
                , this.mob.y * TileSize + scene.offsetY
                , 10
                , 0x40c9c1);
        this.arc = scene.physics.add.existing(this.arc, false);
        scene.physics.moveTo
            (this.arc
                , mob.targetX * TileSize + scene.offsetX
                , mob.targetY * TileSize + scene.offsetY
                , mob.speed * TileSize);
    }

    updateFromMob(mob: Mob) {
        this.mob = mob;
        this.arc.setPosition(mob.x * TileSize + this.scene.offsetX, mob.y * TileSize + this.scene.offsetY);
        this.scene.physics.moveTo
            (this.arc
                , this.mob.targetX * TileSize + this.scene.offsetX
                , this.mob.targetY * TileSize + this.scene.offsetY
                , this.mob.speed * TileSize);
        // FillColor from health/maxhealth (green to red)        
        let healthyColor = Phaser.Display.Color.HexStringToColor('#40c9c1');
        let unhealthyColor = Phaser.Display.Color.HexStringToColor('0x3DBF53');
        // this.arc.setFillStyle(Phaser.Display.Color.Interpolate.ColorWithColor(healthyColor, unhealthyColor, this.mob.maxHealth, this.mob.health).color);
    }

    destroy() {
        this.arc.destroy();
    }
}
