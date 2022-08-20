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
    price: number;
    speed: number;
    health: number;
}
