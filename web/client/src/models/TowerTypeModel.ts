export interface TowerTypeLevelModel {
    level: number;
    cost: number;
    damage: number;
    range: number;
    splashRange: number;
    splashDmg: number;
    // effect: number;
    fireRate: number;
    bulletSpeed: number;
}

interface TowerTypeModel {
    name: string;
    description: string;
    key: string;
    levels: TowerTypeLevelModel[];
}

namespace TowerTypeModel {
    export function fromJSON(json: any): TowerTypeModel {
        return {
            name: json.name,
            description: json.description,
            key: json.key,
            levels: json.levels.map((jsonLevel: any) => ({
                level: Number.parseInt(jsonLevel.level),
                cost: Number.parseFloat(jsonLevel.cost),
                damage: Number.parseFloat(jsonLevel.damage),
                range: Number.parseFloat(jsonLevel.range),
                splashRange: Number.parseFloat(jsonLevel.splashRange),
                splashDmg: Number.parseFloat(jsonLevel.splashDmg),
                // effect: jsonLevel.effect;
                fireRate: Number.parseFloat(jsonLevel.fireRate),
                bulletSpeed: Number.parseFloat(jsonLevel.bulletSpeed),
            })),
        }
    }
}

export default TowerTypeModel;