import { TWMap } from "./twmap";
import { Tower } from "./tower";
import { Bullet } from "./bullet";
import { Mob } from "./mob";

// container that holds the field data
export type Field = {
    id: number;
    player: Player;
    twMap: TWMap;
    towers: Tower[];
    mobs: Mob[];
    bullets: Bullet[];
}
