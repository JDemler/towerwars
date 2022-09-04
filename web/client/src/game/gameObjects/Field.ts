import { Application, Container } from "pixi.js";
import { FieldModel, MapModel, PlayerModel } from "../../models";
import { GameStateChangeAction, FieldChangeAction } from '../GameClient';
import Map from "./Map";
import { GameObject } from "./GameObject";
import { Tower } from "./Tower";
import { Mob } from "./Mob";
import { Bullet } from "./Bullet";
import GameClient from '../GameClient';
import GridCoordinate from "../../lib/GridCoordinate";

export default class Field extends GameObject {
    id: number;
    gameClient: GameClient;

    mapModel: MapModel;
    player: PlayerModel;

    container: Container;

    get towers() {
        return this.getChildren(Tower);
    }

    get mobs(): Mob[] {
        return this.getChildren(Mob);
    }

    get bullets(): Bullet[] {
        return this.getChildren(Bullet);
    }

    get map(): Map {
        return this.getChild(Map)!;
    }

    constructor(app: Application, gameClient: GameClient, fieldModel: FieldModel) {
        super(app);
        this.id = fieldModel.id;
        this.gameClient = gameClient;

        this.mapModel = fieldModel.map;
        this.player = fieldModel.player;

        this.container = new Container();
        this.container.sortableChildren = true;

        app.stage.addChild(this.container);

        this.createChild(new Map(app, this, this.mapModel));

        for (const towerModel of fieldModel.towers) {
            this.createChild(new Tower(app, this, towerModel));
        }
        
        for (const mobModel of fieldModel.mobs) {
            this.createChild(new Mob(app, this, mobModel));
        }

        for (const bulletModel of fieldModel.bullets) {
            const mob = this.mobs.find(mob => mob.id === bulletModel.targetId);
            if (mob === undefined) {
                console.error('Unknown target mob: ' + bulletModel.targetId);
                continue;
            }

            this.createChild(new Bullet(app, this, bulletModel, mob));
        }

        console.log('Creating field', fieldModel);
    }

    onUpdate(delta: number, deltaMs: number): void {
        
    }
    
    onDestroy(): void {
        this.container.destroy();
    }

    onTileClick(coordinate: GridCoordinate) {
        this.gameClient.buildTurret(coordinate);
    }

    handleGameChangeAction(action: FieldChangeAction) {
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
                        this.createChild(new Tower(this.app, this, action.tower));
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
                        this.createChild(new Mob(this.app, this, action.mob));
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

                        this.createChild(new Bullet(this.app, this, action.bullet, mob));
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
                // console.log('Not a field change action: ' + action.type);
                break;
        }
    }
}