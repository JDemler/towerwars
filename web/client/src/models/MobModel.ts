import GridCoordinate from '../lib/GridCoordinate';
import { ServerTileSize } from './GameState';

interface MobModel {
    id: number;
    coordinate: GridCoordinate;
    targetCoordinate: GridCoordinate;
    speed: number;
    health: number;
    maxHealth: number;
    reward: number;
    type: string;
}

namespace MobModel {
    export function fromJSON(json: any): MobModel {
        return {
            id: json.id,
            coordinate: new GridCoordinate(
                json.x / ServerTileSize,
                json.y / ServerTileSize
            ),
            targetCoordinate: new GridCoordinate(
                json.targetX / ServerTileSize,
                json.targetY / ServerTileSize
            ),
            speed: json.speed,
            health: json.health,
            maxHealth: json.max_health,
            reward: json.reward,
            type: json.type,
        };
    }
}

export default MobModel;