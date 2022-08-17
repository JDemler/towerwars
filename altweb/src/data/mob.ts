import GameScene from "../scenes/Game";


export type Mob = {
    id: number;
    x: number;
    y: number;
    speed: number;
    targetX: number;
    targetY: number;
    health: number;
    maxHealth: number;
    mobtype: string;
}
