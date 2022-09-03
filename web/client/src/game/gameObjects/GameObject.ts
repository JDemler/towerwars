import { Application } from "pixi.js";
import { Constructor } from "../../lib/helpers";

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

    
    public getChild<T extends GameObject>(type: Constructor<T>) {
        return this.children
            .find(child => child instanceof type) as T | undefined
    }
    
    public getChildren<T extends GameObject>(type: Constructor<T>) {
        return this.children
            .filter(child => child instanceof type)
            .map(child => child as T)
    }
}
