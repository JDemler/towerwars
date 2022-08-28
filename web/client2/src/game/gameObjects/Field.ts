import { Application, Graphics } from "pixi.js";
import { FieldModel, MapModel, PlayerModel, TowerModel } from "../../models";
import { GameChangeAction } from '../GameClient';

export abstract class GameObject {
    app: Application;

    children: GameObject[] = [];

    constructor(app: Application) {
        this.app = app;
    }

    update(delta: number) {
        this.onUpdate(delta);
        this.children.forEach(child => child.update(delta));
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

    abstract onUpdate(delta: number): void;

    abstract onDestroy(): void;
}

export default class Field extends GameObject {
    id: number;
    map: MapModel;
    player: PlayerModel;

    get towers(): Tower[] {
        return this.children.filter(child => child instanceof Tower) as Tower[];
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

        console.log('Creating field', fieldModel);
        // this.mobs = fieldModel.mobs.map(mobModel => new Mob(app, mobModel));
    }

    onUpdate(delta: number): void {

    }
    
    onDestroy(): void {

    }

    handleGameChangeAction(action: GameChangeAction) {
        switch(action.type) {
            case 'field':
                break;
            case 'player':
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
                break;
            case 'bullet':
                break;
            default:
                console.log('Not a field change action: ' + action.type);
                break;
        }
    }
}

export class Tower extends GameObject {
    id: number;

    towerCircle: Graphics;

    constructor(app: Application, towerModel: TowerModel) {
        super(app);

        this.id = towerModel.id;
        
        this.towerCircle = new Graphics()
            .beginFill(0x00ff00)
            .drawCircle(150, 150, 50);

        this.app.stage.addChild(this.towerCircle);
    }

    onUpdate(delta: number): void {
        
    }

    onDestroy(): void {
        this.towerCircle.destroy();
    }

    updateFromModel(towerModel: TowerModel) {

    }

}