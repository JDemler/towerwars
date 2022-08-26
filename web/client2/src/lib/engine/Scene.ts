import { Application } from 'pixi.js';
import GameObject from './GameObject';

export default abstract class Scene {
    app: Application;
    gameObjects: GameObject[] = [];

    constructor(app: Application) {
        // this.gameObjects = [];
        this.app = app;

        this.app.ticker.add((deltaTime) => {
            this.update(deltaTime);
        });

        this.onStart();
    }
    
    update(deltaTime: number) {
        for (const gameObject of this.gameObjects) {
            gameObject.update(deltaTime);
        }

        this.onUpdate(deltaTime);
    }

    abstract onUpdate(deltaTime: number): void;

    abstract onStart(): void;

    instantiate(gameObject: GameObject) {
        this.gameObjects.push(gameObject);
        
        this.app.stage.addChild(gameObject.displayObject);
    }
}