import { Application, Graphics } from "pixi.js";
import { BulletModel, FieldModel, MapModel, MobModel, PlayerModel, TowerModel } from "../../models";
import { GameChangeAction } from '../GameClient';
import { GridSettings } from '../../lib/GridSettings';
import GridCoordinate from '../../lib/GridCoordinate';

export abstract class GameObject {
    app: Application;

    children: GameObject[] = [];

    constructor(app: Application) {
        this.app = app;
    }

    update(delta: number, deltaMs: number) {
        this.onUpdate(delta, deltaMs);
        this.children.forEach(child => child.update(delta, deltaMs));
    }

    public createChild(child: GameObject) {
        this.children.push(child);
    }

    public destroyChild(child: GameObject) {
        this.children = this.children.filter(c => c !== child);
        child.destroy();
    }

    public destroy() {
        this.onDestroy();
        this.children.forEach(child => child.destroy());
    }

    abstract onUpdate(delta: number, deltaMs: number): void;

    abstract onDestroy(): void;
}

export default class Field extends GameObject {
    id: number;
    map: MapModel;
    player: PlayerModel;

    get towers(): Tower[] {
        return this.children.filter(child => child instanceof Tower) as Tower[];
    }

    get mobs(): Mob[] {
        return this.children.filter(child => child instanceof Mob) as Mob[];
    }

    get bullets(): Bullet[] {
        return this.children.filter(child => child instanceof Bullet) as Bullet[];
    }
    // mobs: MobModel[];

    constructor(app: Application, fieldModel: FieldModel) {
        super(app);
        this.id = fieldModel.id;
        this.map = fieldModel.map;
        this.player = fieldModel.player;

        for (const towerModel of fieldModel.towers) {
            this.createChild(new Tower(app, towerModel));
        }
        
        for (const mobModel of fieldModel.mobs) {
            this.createChild(new Mob(app, mobModel));
        }

        for (const bulletModel of fieldModel.bullets) {
            const mob = this.mobs.find(mob => mob.id === bulletModel.targetId);
            if (mob === undefined) {
                console.error('Unknown target mob: ' + bulletModel.targetId);
                continue;
            }

            this.createChild(new Bullet(app, bulletModel, mob));
        }

        console.log('Creating field', fieldModel);
    }

    onUpdate(delta: number, deltaMs: number): void {

    }
    
    onDestroy(): void {

    }

    handleGameChangeAction(action: GameChangeAction) {
        switch(action.type) {
            case 'field':
                console.error('Field actions not implemented');
                break;
            case 'player':
                if (action.kind === 'update') {
                    this.player = action.player;
                    break;
                }
                console.error(`Player actions with kind "${action.kind}" not implemented`);
                break;
            case 'tower':
                switch (action.kind) {
                    case 'create': {
                        this.createChild(new Tower(this.app, action.tower));
                        break;
                    }
                    case 'update': {
                        const tower = this.towers.find(tower => tower.id === action.tower.id);
                        if (tower === undefined) {
                            console.error('Unknown tower: ' + action.tower.id);
                            return;
                        }

                        tower.updateFromModel(action.tower);
                        break;
                    }
                    case 'delete': {
                        const tower = this.towers.find(tower => tower.id === action.towerId);
                        if (tower === undefined) {
                            console.error('Unknown tower: ' + action.towerId);
                            return;
                        }
                        this.destroyChild(tower);
                        break;
                    }
                }
                break;
            case 'mob':
                switch (action.kind) {
                    case 'create': {
                        this.createChild(new Mob(this.app, action.mob));
                        break;
                    }
                    case 'update': {
                        const mob = this.mobs.find(mob => mob.id === action.mob.id);
                        if (mob === undefined) {
                            console.error('Unknown mob: ' + action.mob.id);
                            return;
                        }

                        mob.updateFromModel(action.mob);
                        break;
                    }
                    case 'delete': {
                        const mob = this.mobs.find(mob => mob.id === action.mobId);
                        if (mob === undefined) {
                            console.error('Unknown mob: ' + action.mobId);
                            return;
                        }
                        this.destroyChild(mob);
                        break;
                    }
                }
                break;
            case 'bullet':
                switch (action.kind) {
                    case 'create': {
                        const mob = this.mobs.find(mob => mob.id === action.bullet.targetId);
                        if (mob === undefined) {
                            console.error('Unknown target mob: ' + action.bullet.targetId);
                            return;
                        }

                        this.createChild(new Bullet(this.app, action.bullet, mob));
                        break;
                    }
                    case 'update': {
                        const bullet = this.bullets.find(bullet => bullet.id === action.bullet.id);
                        if (bullet === undefined) {
                            console.error('Unknown bullet: ' + action.bullet.id);
                            return;
                        }
                        
                        bullet.updateFromModel(action.bullet);
                        break;
                    }
                    case 'delete': {
                        const bullet = this.children.find(child => child instanceof Bullet && child.id === action.bulletId);
                        if (bullet === undefined) {
                            console.error('Unknown bullet: ' + action.bulletId);
                            return;
                        }
                        this.destroyChild(bullet);
                        break;
                    }
                }
                break;
            default:
                console.log('Not a field change action: ' + action.type);
                break;
        }
    }
}

export class Tower extends GameObject {
    id: number;
    towerModel: TowerModel;

    towerCircle: Graphics;

    constructor(app: Application, towerModel: TowerModel) {
        super(app);

        this.id = towerModel.id;
        this.towerModel = towerModel;

        this.towerCircle = new Graphics()
            .beginFill(0x00ff00)
            .drawCircle(towerModel.coordinate.tileCenterX, towerModel.coordinate.tileCenterY, GridSettings.tileSize / 2);

        this.app.stage.addChild(this.towerCircle);
    }

    onUpdate(delta: number, deltaMs: number): void {
        this.towerCircle.position.set(this.towerModel.coordinate.tileCenterX, this.towerModel.coordinate.tileCenterY);
    }

    onDestroy(): void {
        this.towerCircle.destroy();
    }

    updateFromModel(towerModel: TowerModel) {
        this.towerModel = towerModel;
    }
}

export class Mob extends GameObject {
    id: number;
    mobModel: MobModel;

    mobCircle: Graphics;
    currentCoordinate: GridCoordinate;

    constructor(app: Application, mobModel: MobModel) {
        super(app);

        this.id = mobModel.id;
        this.mobModel = mobModel;
        
        this.mobCircle = new Graphics()
            .beginFill(0x0000ff)
            .drawCircle(mobModel.coordinate.tileCenterX, mobModel.coordinate.tileCenterY, GridSettings.tileSize / 2);

        this.currentCoordinate = mobModel.coordinate;

        this.app.stage.addChild(this.mobCircle);
    }

    onUpdate(_: number, deltaMs: number): void {
        const newPosition = this.currentCoordinate.moveTo(this.mobModel.targetCoordinate, this.mobModel.speed, deltaMs);
        
        this.currentCoordinate = newPosition;

        this.mobCircle.position.set(newPosition.tileCenterX, newPosition.tileCenterY);
    }

    onDestroy(): void {
        this.mobCircle.destroy();
    }

    updateFromModel(mobModel: MobModel) {
        this.mobModel = mobModel;
        this.currentCoordinate = this.mobModel.coordinate;
    }
}

export class Bullet extends GameObject {
    id: number;
    bulletModel: BulletModel;

    bulletCircle: Graphics;
    currentCoordinate: GridCoordinate;

    targetMob: Mob;

    constructor(app: Application, bulletModel: BulletModel, targetMob: Mob) {
        super(app);

        this.id = bulletModel.id;
        this.bulletModel = bulletModel;
        
        this.bulletCircle = new Graphics()
            .beginFill(0xffff00)
            .drawCircle(bulletModel.coordinate.tileCenterX, bulletModel.coordinate.tileCenterY, GridSettings.tileSize / 4);

        this.targetMob = targetMob;

        this.currentCoordinate = bulletModel.coordinate;

        this.app.stage.addChild(this.bulletCircle);
    }

    onUpdate(delta: number, deltaMs: number): void {
        const targetCoordinate = this.targetMob.currentCoordinate;
        
        const newPosition = this.currentCoordinate.moveTo(targetCoordinate, this.bulletModel.speed, deltaMs);
        
        this.currentCoordinate = newPosition;

        this.bulletCircle.position.set(newPosition.tileCenterX, newPosition.tileCenterY);
    }

    onDestroy(): void {
        this.bulletCircle.destroy();
    }

    updateFromModel(bulletModel: BulletModel) {
        this.bulletModel = bulletModel;
    }
}