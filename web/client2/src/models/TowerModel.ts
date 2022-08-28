import GridCoordinate from '../lib/GridCoordinate';

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
            coordinate: new GridCoordinate(json.x, json.y),
            damage: json.damage,
            range: json.range,
            fireRate: json.fireRate,
            cooldown: json.cooldown,
        };
    }
}

export default TowerModel;