import { DisplayObject, Graphics } from "pixi.js";
import Script from "./Script";
import Transform from "./scripts/Transform";

export default abstract class GameObject {
    scripts: Script[];
    transform: Transform;

    displayObject: DisplayObject;

    constructor() {
        this.transform = new Transform(this);

        this.scripts = [this.transform];

        this.displayObject = this.render();

        this.transform.onUpdate(0);
    }

    abstract render(): DisplayObject;

    update(deltaTime: number) {
        for (const script of this.scripts) {
            script.update(deltaTime);
        }
    }
}