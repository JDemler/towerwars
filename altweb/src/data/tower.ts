import { TileSize } from '../config';
import GameScene from '../scenes/Game';

// type that represents a tower
export type Tower = {
    x: number;
    y: number;
    range: number;
    tower_type: string;
}

export function drawTower(tower: Tower, scene: GameScene): void {
    scene.add.rectangle(tower.x + scene.offsetX, tower.y + scene.offsetY, TileSize / 2, TileSize / 2, 0x0000ff);
}