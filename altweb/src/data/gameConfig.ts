export type TowerType = {
    name: string;
    description: string;
    levels: TowerLevel[];
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
