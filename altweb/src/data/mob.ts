import GameScene from "../scenes/Game";


export type Mob = {
    x: number;
    y: number;
    speed: number;
    targetX: number;
    targetY: number;
    health: number;
    maxHealth: number;
    mobtype: string;
}

export function drawMob(mob: Mob, scene: GameScene) {
    scene.add.circle(mob.x + scene.offsetX, mob.y + scene.offsetY, 10, 0x00ff00);
}