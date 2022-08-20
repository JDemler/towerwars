import { TileSize } from '../config';
import GameScene from '../scenes/Game';

// type that represents a tower
export type Tower = {
    id: number;
    x: number;
    y: number;
    range: number;
    towerType: string;
    level: number;
}