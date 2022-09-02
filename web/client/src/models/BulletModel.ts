import GridCoordinate from '../lib/GridCoordinate';

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
            coordinate: new GridCoordinate(json.x - 0.5, json.y - 0.5),
            speed: json.speed,
            damage: json.damage,
            targetId: json.targetId,
        };
    }
}

export default BulletModel;