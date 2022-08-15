import { TWMap } from "./twmap";
import { Tower } from "./tower";
import { Bullet } from "./bullet";
import { Mob } from "./mob";

// container that holds the field data
export type Field = {
    id: number;
    player: Player;
    twmap: TWMap;
    towers: Tower[];
    mobs: Mob[];
    bullets: Bullet[];
    towerType: string;
}
