export type TowerType = {
    name: string;
    description: string;
    key: string;
    levels: TowerLevel[];
}

export function towerTypeToColor(towerType: TowerType): number {
    switch (towerType.key) {
        case "likeButton":
            return 0x4267B2;
        case "profilePicture":
            return 0x40C9C1;
        case "comment":
            return 0x3DBF53;
        default:
            return 0xffffff;
    }
}

export type TowerLevel = {
    damage: number;
    range: number;
    speed: number;
    cooldown: number;
    cost: number;
}

export type MobType = {
    name: string;
    description: string;
    key: string;
    cost: number;
    income: number;
    speed: number;
    health: number;
}
