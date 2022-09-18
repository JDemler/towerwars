import { BulletModel, TowerModel, MobModel, PlayerModel, MapModel, BarracksModel } from "@models";

interface FieldModel {
    id: number;
    player: PlayerModel;
    network: string;
    map: MapModel;
    mobs: MobModel[];
    bullets: BulletModel[];
    towers: TowerModel[];
    barracks: BarracksModel;
}

namespace FieldModel {
    export function fromJSON(json: any): FieldModel {
        return {
            id: json.id,
            player: PlayerModel.fromJSON(json.player),
            network: json.socialNetwork,
            map: MapModel.fromJSON(json.twmap),
            mobs: json.mobs.map((jsonMob: any) => MobModel.fromJSON(jsonMob)),
            bullets: json.bullets.map((jsonBullet: any) => BulletModel.fromJSON(jsonBullet)),
            towers: json.towers.map((jsonTower: any) => TowerModel.fromJSON(jsonTower)),
            barracks: BarracksModel.fromJSON(json.barracks),
        }
    }
}

export default FieldModel;