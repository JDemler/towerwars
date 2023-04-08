import { Container } from "pixi.js";
import { FieldModel, MapModel, PlayerModel } from "@models";
import { GameObject, Tower, Mob, Bullet, Map, IGameObjectProps } from "@gameObjects";
import { FieldChangeAction } from '@game/GameClient';
import { GridCoordinate } from "@grid";
import Player from "./Player";

export default class Field extends GameObject {
    id: number;

    mapModel: MapModel;
    playerModel: PlayerModel;

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

    get player(): Player {
        return this.getChild(Player)!;
    }

    get isCurrentPlayer(): boolean {
        return this.gameClient.player?.fieldId === this.id;
    }

    constructor(props: IGameObjectProps, fieldModel: FieldModel) {
        super(props);
        this.id = fieldModel.id;

        this.mapModel = fieldModel.map;
        this.playerModel = fieldModel.player;

        this.container = new Container();
        this.container.sortableChildren = true;

        this.viewport.addChild(this.container);

        this.createChild(new Map(this.props, this, this.mapModel, this.isCurrentPlayer));
        this.createChild(new Player(this.props, this, this.mapModel, this.playerModel, this.isCurrentPlayer));

        for (const towerModel of fieldModel.towers) {
            this.createChild(new Tower(this.props, this, towerModel));
        }
        
        for (const mobModel of fieldModel.mobs) {
            this.createChild(new Mob(this.props, this, mobModel));
        }



        for (const bulletModel of fieldModel.bullets) {
            const mob = this.mobs.find(mob => mob.id === bulletModel.targetId);
            if (mob === undefined) {
                console.error('Unknown target mob: ' + bulletModel.targetId);
                continue;
            }

            this.createChild(new Bullet(this.props, this, bulletModel, mob));
        }
    }
    
    onDestroy(): void {
        this.container.destroy();
    }

    onTileClick(coordinate: GridCoordinate) {
        if (!this.isCurrentPlayer)
            return;

        const existingTower = this.towers.find(tower => tower.towerModel.coordinate.equals(coordinate))

        if (existingTower === undefined) {
            // No tower at that position. Buy a new one.
            const towerTypeModel = this.gameInfo.selectedTowerType;
            if (towerTypeModel === null)
                return;

            this.gameClient.buildTurret(coordinate, towerTypeModel.key);
        } else {
            // There is already a tower here. Select the tower.
            this.dispatchUiState({ type: 'set-selectedTower', selectedTower: existingTower.towerModel });
            this.gameInfo.selectedTowerId = existingTower.id;

            console.log('Selected tower: ' + existingTower.towerModel.id);
        }
    }

    handleGameChangeAction(action: FieldChangeAction) {
        switch(action.type) {
            case 'field':
                console.error('Field actions not implemented');
                break;
            case 'player':
                if (action.kind !== 'delete' && this.isCurrentPlayer) {
                    this.dispatchUiState({ type: 'set-playerModel', playerModel: action.player });
                }

                if (action.kind === 'update') {                    
                    this.playerModel = action.player;
                    this.player.updateFromModel(action.player);                     
                    break;
                }
                break;
            case 'tower':
                switch (action.kind) {
                    case 'create': {
                        this.createChild(new Tower(this.props, this, action.tower));
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
                        this.createChild(new Mob(this.props, this, action.mob));
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

                        this.createChild(new Bullet(this.props, this, action.bullet, mob));
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
                console.warn('Not a field change action: ' + action.type);
                break;
        }
    }
}