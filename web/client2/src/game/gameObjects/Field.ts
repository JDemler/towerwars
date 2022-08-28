import { Application, Graphics } from "pixi.js";

export abstract class GameObject {
    app: Application;

    children: GameObject[] = [];

    constructor(app: Application) {
        this.app = app;

        this.onStart();
    }

    update(delta: number) {
        this.onUpdate(delta);
        this.children.forEach(child => child.update(delta));
    }

    destroy() {
        this.onDestroy();
        this.children.forEach(child => child.destroy());
    }

    abstract onStart(): void;

    abstract onUpdate(delta: number): void;

    abstract onDestroy(): void;
}

export default class Field extends GameObject {
    id: number;
    // twmap: TWMap;
    // player: Player;
    // towers: Tower[] = [];
    // mobs: Mob[] = [];
    
    constructor(app: Application, id: number/*, twmap: TWMap, player: Player*/) {
        super(app);
        this.id = id;
        // this.twmap = twmap;
        // this.player = player;
    }

    onUpdate(delta: number): void {

    }
    
    onStart(): void {

    }
    
    onDestroy(): void {

    }
}

export class Tower extends GameObject {
    towerCircle?: Graphics;

    onStart(): void {
        this.towerCircle = new Graphics()
            .beginFill(0x00ff00)
            .drawCircle(150, 150, 50);

        this.app.stage.addChild(this.towerCircle);
    }
    onUpdate(delta: number): void {
        
    }
    onDestroy(): void {
        
    }

}