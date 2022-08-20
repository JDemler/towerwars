import GridCoordinate from '../lib/GridCoordinate';
import { ServerTileSize } from './GameState';


interface BulletModel {
    id: number;
    coordinate: GridCoordinate;
    speed: number;
    damage: number;
    targetId: number;
}

namespace BulletModel {
    export function fromJSON(json: any): BulletModel {
        return {
            id: json.id,
            coordinate: new GridCoordinate(
                json.x / ServerTileSize,
                json.y / ServerTileSize
            ),
            speed: json.speed,
            damage: json.damage,
            targetId: json.targetId,
        };
    }
}

export default BulletModel;