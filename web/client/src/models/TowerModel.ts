import { GridCoordinate } from '@grid';

interface TowerModel {
    id: number;
    coordinate: GridCoordinate;
    damage: number;
    range: number;
    fireRate: number;
    cooldown: number;
    level: number;
    splash: number;
    splashDmg: number;
    type: string;
}

namespace TowerModel {
    export function fromJSON(json: any): TowerModel {
        return {
            id: json.id,
            coordinate: new GridCoordinate(json.x - 0.5, json.y - 0.5),
            damage: json.damage,
            range: json.range,
            fireRate: json.fireRate,
            cooldown: json.cooldown,
            level: json.level,
            splash: json.splash,
            splashDmg: json.splashDmg,
            type: json.type,
        };
    }
}

export default TowerModel;