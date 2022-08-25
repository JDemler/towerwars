import GameObject from '../GameObject';
import Script from '../Script';
import Vector2 from '../types/Vector2';

export default class Transform extends Script {
    position: Vector2;
    // rotation: Quaternion;
    scale: Vector2;
    parent: Transform | null;
    children: Transform[];
    gameObject: GameObject;
    enabled: boolean;

    constructor(gameObject: GameObject) {
        super();

        this.position = new Vector2(0, 0);
        // this.rotation = new Quaternion(0, 0, 0, 1);
        this.scale = new Vector2(1, 1);
        this.parent = null;
        this.children = [];
        this.gameObject = gameObject;
        this.enabled = true;
    }
    
    onUpdate(deltaTime: number) {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update(deltaTime);
        }
    }

    addChild(child: Transform) {
        this.children.push(child);
        child.parent = this;
    }
    
    removeChild(child: Transform) {
        let index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
}