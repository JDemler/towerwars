import GridCoordinate from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';

const ServerTileSize = 32;

export default class GameState {
    fields: FieldModel[];
    elapsed: number;
    incomeCooldown: number;
    state: "WaitingForPlayers" | "Playing" | "GameOver";

    constructor(fields: FieldModel[], elapsed: number, incomeCooldown: number, state: "WaitingForPlayers" | "Playing" | "GameOver") {
        this.fields = fields;
        this.elapsed = elapsed;
        this.incomeCooldown = incomeCooldown;
        this.state = state;
    }

    static fromJSON(json: any): GameState {
        return new GameState(
            json.fields.map((jsonField: any) => FieldModel.fromJSON(jsonField)),
            json.elapsed,
            json.incomeCooldown,
            json.state,
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
            json.id,
            PlayerModel.fromJSON(json.player),
            MapModel.fromJSON(json.twmap),
            json.mobs.map((jsonMob: any) => MobModel.fromJSON(jsonMob)),
            json.bullets.map((jsonBullet: any) => BulletModel.fromJSON(jsonBullet)),
            json.towers.map((jsonTower: any) => TowerModel.fromJSON(jsonTower)),
        );
    }
}

export class MapModel {
    size: GridSize;
    start: GridCoordinate;
    end: GridCoordinate;
    tiles: { x: number, y: number }[];
    
    constructor(size: GridSize, start: GridCoordinate, end: GridCoordinate, tiles: { x: number, y: number }[]) {
        this.size = size;
        this.start = start;
        this.end = end;
        this.tiles = tiles;
    }

    static fromJSON(json: any): MapModel {
        return new MapModel(
            new GridSize(json.width, json.height),
            new GridCoordinate(json.xstart, json.ystart),
            new GridCoordinate(json.xend, json.yend),
            json.tiles,
        );
    }
}

export class PlayerModel {
    id: number;
    money: number;
    income: number;
    lives: number;

    constructor(id: number, money: number, income: number, lives: number) {
        this.id = id;
        this.money = money;
        this.income = income;
        this.lives = lives;
    }

    static fromJSON(json: any): PlayerModel {
        return new PlayerModel(
            json.id,
            json.money,
            json.income,
            json.lives,
        );
    }
}

export type MobType = "Circle";

export class MobModel {
    id: number;
    coordinate: GridCoordinate;
    targetCoordinate: GridCoordinate;
    speed: number;
    health: number;
    maxHealth: number;
    reward: number;
    type: MobType;

    constructor(id: number, coordinate: GridCoordinate, targetCoordinate: GridCoordinate, speed: number, health: number, maxHealth: number, reward: number, type: MobType) {
        this.id = id;
        this.coordinate = coordinate;
        this.targetCoordinate = targetCoordinate;
        this.speed = speed;
        this.health = health;
        this.maxHealth = maxHealth;
        this.reward = reward;
        this.type = type;
    }

    static fromJSON(json: any): MobModel {
        return new MobModel(
            json.id,
            new GridCoordinate(
                json.x / ServerTileSize,
                json.y / ServerTileSize,
            ),
            new GridCoordinate(
                json.targetX / ServerTileSize,
                json.targetY / ServerTileSize,
            ),
            json.speed,
            json.health,
            json.max_health,
            json.reward,
            json.type,
        );
    }
}

export class BulletModel {
    id: number;
    coordinate: GridCoordinate;
    speed: number;
    damage: number;

    constructor(id: number, coordinate: GridCoordinate, speed: number, damage: number) {
        this.id = id;
        this.coordinate = coordinate;
        this.speed = speed;
        this.damage = damage;
    }

    static fromJSON(json: any): BulletModel {
        return new BulletModel(
            json.id,
            new GridCoordinate(
                json.x / ServerTileSize,
                json.y / ServerTileSize,
            ),
            json.speed,
            json.damage,
        );
    }
}

export class TowerModel {
    coordinate: GridCoordinate;
    damage: number;
    range: number;
    fireRate: number;
    cooldown: number;

    constructor(coordinate: GridCoordinate, damage: number, range: number, fireRate: number, cooldown: number) {
        this.coordinate = coordinate;
        this.damage = damage;
        this.range = range;
        this.fireRate = fireRate;
        this.cooldown = cooldown;
    }

    static fromJSON(json: any): TowerModel {
        
        const tower = new TowerModel(
            new GridCoordinate(
                (json.x - ServerTileSize * 0.5) / ServerTileSize, 
                (json.y - ServerTileSize * 0.5) / ServerTileSize,
            ),
            json.damage,
            json.range / ServerTileSize,
            json.fire_rate,
            json.cooldown,
        );
        return tower;
    }
}