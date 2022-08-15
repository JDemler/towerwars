import { TileSize } from '../config';

// type that represents a tower
export type Tower = {
    x: number;
    y: number;
    range: number;
    tower_type: string;
}

export function drawTower(tower: Tower, scene: Phaser.Scene): void {
    scene.add.rectangle(tower.x, tower.y, TileSize / 2, TileSize / 2, 0x0000ff);
}