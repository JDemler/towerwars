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
            coordinate: new GridCoordinate(json.x - 0.5, json.y - 0.5),
            targetCoordinate: new GridCoordinate(json.targetX - 0.5, json.targetY - 0.5),
            speed: json.speed,
            health: json.health,
            maxHealth: json.maxHealth,
            reward: json.reward,
            type: json.type,
        };
    }
}

export default MobModel;