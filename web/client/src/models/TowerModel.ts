import GridCoordinate from '../lib/GridCoordinate';
import { ServerTileSize } from './GameState';

interface TowerModel {
    id: number;
    coordinate: GridCoordinate;
    damage: number;
    range: number;
    fireRate: number;
    cooldown: number;
}

namespace TowerModel {
    export function fromJSON(json: any): TowerModel {
        return {
            id: json.id,
            coordinate: new GridCoordinate(
                (json.x - ServerTileSize * 0.5) / ServerTileSize,
                (json.y - ServerTileSize * 0.5) / ServerTileSize
            ),
            damage: json.damage,
            range: json.range / ServerTileSize,
            fireRate: json.fireRate,
            cooldown: json.cooldown,
        };
    }
}

export default TowerModel;