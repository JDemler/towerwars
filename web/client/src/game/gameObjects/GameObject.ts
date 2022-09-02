import { Application } from "pixi.js";


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
