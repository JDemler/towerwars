import GridCoordinate from '../../lib/GridCoordinate';
export default class GameState {
    fields: FieldModel[];
    elapsed: number;
    incomeCooldown: number;
    mobRespawnTime: number;
    state: "WaitingForPlayers" | "Playing" | "GameOver";

    constructor(fields: FieldModel[], elapsed: number, incomeCooldown: number, mobRespawnTime: number, state: "WaitingForPlayers" | "Playing" | "GameOver") {
        this.fields = fields;
        this.elapsed = elapsed;
        this.incomeCooldown = incomeCooldown;
        this.mobRespawnTime = mobRespawnTime;
        this.state = state;
    }
}

export class FieldModel {
    id: number;
    player: PlayerModel;
    mobs: MobModel[];
    bullets: BulletModel[];
    towers: TowerModel[];

    constructor(id: number, player: PlayerModel, mobs: MobModel[], bullets: BulletModel[], towers: TowerModel[]) {
        this.id = id;
        this.player = player;
        this.mobs = mobs;
        this.bullets = bullets;
        this.towers = towers;
    }
}

export class PlayerModel {
    money: number;
    income: number;
    lives: number;

    constructor(money: number, income: number, lives: number) {
        this.money = money;
        this.income = income;
        this.lives = lives;
    }
}

export class MobModel {
    coordinate: GridCoordinate;
    speed: number;
    targetCoordinate: GridCoordinate;
    health: number;
    maxHealth: number;
    reward: number;
    reachedTarget: boolean;

    constructor(coordinate: GridCoordinate, speed: number, targetCoordinate: GridCoordinate, health: number, maxHealth: number, reward: number, reachedTarget: boolean) {
        this.coordinate = coordinate;
        this.speed = speed;
        this.targetCoordinate = targetCoordinate;
        this.health = health;
        this.maxHealth = maxHealth;
        this.reward = reward;
        this.reachedTarget = reachedTarget;
    }
}

export class BulletModel {
    coordinate: GridCoordinate;
    speed: number;
    damage: number;
    irrelevant: boolean;
    target: MobModel;

    constructor(coordinate: GridCoordinate, speed: number, damage: number, irrelevant: boolean, target: MobModel) {
        this.coordinate = coordinate;
        this.speed = speed;
        this.damage = damage;
        this.irrelevant = irrelevant;
        this.target = target;
    }
}

export class TowerModel {
    coordinate: GridCoordinate;
    damage: number;
    range: number;
    fireRate: number;
    cooldown: number;
    bulletSpeed: number;

    constructor(coordinate: GridCoordinate, damage: number, range: number, fireRate: number, cooldown: number, bulletSpeed: number) {
        this.coordinate = coordinate;
        this.damage = damage;
        this.range = range;
        this.fireRate = fireRate;
        this.cooldown = cooldown;
        this.bulletSpeed = bulletSpeed;
    }
}