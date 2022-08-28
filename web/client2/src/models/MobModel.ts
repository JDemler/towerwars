import GridCoordinate from '../lib/GridCoordinate';

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
            coordinate: new GridCoordinate(json.x, json.y),
            targetCoordinate: new GridCoordinate(json.targetX, json.targetY),
            speed: json.speed,
            health: json.health,
            maxHealth: json.maxHealth,
            reward: json.reward,
            type: json.type,
        };
    }
}

export default MobModel;