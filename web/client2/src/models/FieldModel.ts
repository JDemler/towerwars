import BulletModel from "./BulletModel";
import TowerModel from "./TowerModel";
import MobModel from "./MobModel";
import PlayerModel from "./PlayerModel";
import MapModel from "./MapModel";

interface FieldModel {
    id: number;
    player: PlayerModel;
    map: MapModel;
    mobs: MobModel[];
    bullets: BulletModel[];
    towers: TowerModel[];
}

namespace FieldModel {
    export function fromJSON(json: any): FieldModel {
        return {
            id: json.id,
            player: PlayerModel.fromJSON(json.player),
            map: MapModel.fromJSON(json.twmap),
            mobs: json.mobs.map((jsonMob: any) => MobModel.fromJSON(jsonMob)),
            bullets: json.bullets.map((jsonBullet: any) => BulletModel.fromJSON(jsonBullet)),
            towers: json.towers.map((jsonTower: any) => TowerModel.fromJSON(jsonTower)),
        }
    }
}

export default FieldModel;