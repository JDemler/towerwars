

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

export function drawMob(mob: Mob, scene: Phaser.Scene) {
    scene.add.circle(mob.x, mob.y, 10, 0x00ff00);    
}