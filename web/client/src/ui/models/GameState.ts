import GridCoordinate from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';

const ServerTileSize = 32;

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

    static fromJSON(json: any): GameState {
        return new GameState(
            json.Fields.map((jsonField: any) => FieldModel.fromJSON(jsonField)),
            json.Elapsed,
            json.IncomeCooldown,
            json.MobRespawnTime,
            json.State,
        );
    }
}

export class FieldModel {
    id: number;
    player: PlayerModel;
    map: MapModel;
    mobs: MobModel[];
    bullets: BulletModel[];
    towers: TowerModel[];

    constructor(id: number, player: PlayerModel, map: MapModel, mobs: MobModel[], bullets: BulletModel[], towers: TowerModel[]) {
        this.id = id;
        this.player = player;
        this.map = map;
        this.mobs = mobs;
        this.bullets = bullets;
        this.towers = towers;
    }

    static fromJSON(json: any): FieldModel {
        return new FieldModel(
            json.Id,
            PlayerModel.fromJSON(json.Player),
            MapModel.fromJSON(json.TWMap),
            json.Mobs.map((jsonMob: any) => MobModel.fromJSON(jsonMob)),
            json.Bullets.map((jsonBullet: any) => BulletModel.fromJSON(jsonBullet)),
            json.Towers.map((jsonTower: any) => TowerModel.fromJSON(jsonTower)),
        );
    }
}

export class MapModel {
    size: GridSize;
    start: GridCoordinate;
    end: GridCoordinate;
    tiles: { X: number, Y: number }[];
    
    constructor(size: GridSize, start: GridCoordinate, end: GridCoordinate, tiles: { X: number, Y: number }[]) {
        this.size = size;
        this.start = start;
        this.end = end;
        this.tiles = tiles;
    }

    static fromJSON(json: any): MapModel {
        return new MapModel(
            new GridSize(json.Width, json.Height),
            new GridCoordinate(json.XStart, json.YStart),
            new GridCoordinate(json.XEnd, json.YEnd),
            json.Tiles,
        );
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

    static fromJSON(json: any): PlayerModel {
        return new PlayerModel(
            json.Money,
            json.Income,
            json.Lives,
        );
    }
}

export class MobModel {
    coordinate: GridCoordinate;
    targetCoordinate: GridCoordinate;
    speed: number;
    health: number;
    maxHealth: number;
    reward: number;
    reachedTarget: boolean;

    constructor(coordinate: GridCoordinate, targetCoordinate: GridCoordinate, speed: number, health: number, maxHealth: number, reward: number, reachedTarget: boolean) {
        this.coordinate = coordinate;
        this.targetCoordinate = targetCoordinate;
        this.speed = speed;
        this.health = health;
        this.maxHealth = maxHealth;
        this.reward = reward;
        this.reachedTarget = reachedTarget;
    }

    static fromJSON(json: any): MobModel {
        return new MobModel(
            new GridCoordinate(json.X / ServerTileSize, json.Y / ServerTileSize),
            new GridCoordinate(json.TargetX / ServerTileSize, json.TargetY / ServerTileSize),
            json.Speed,
            json.Health,
            json.MaxHealth,
            json.Reward,
            json.ReachedTarget,
        );
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

    static fromJSON(json: any): BulletModel {
        return new BulletModel(
            new GridCoordinate(json.X / ServerTileSize, json.Y / ServerTileSize),
            json.Speed,
            json.Damage,
            json.Irrelevant,
            MobModel.fromJSON(json.Target),
        );
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

    static fromJSON(json: any): TowerModel {
        return new TowerModel(
            new GridCoordinate(json.X / ServerTileSize, json.Y / ServerTileSize),
            json.Damage,
            json.Range / ServerTileSize,
            json.FireRate,
            json.Cooldown,
            json.BulletSpeed,
        );
    }
}