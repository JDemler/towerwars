import { Application, Circle, DisplayObject, Graphics, Sprite } from "pixi.js";
import { useEffect, useRef } from "react";
import GameObject from "../lib/engine/GameObject";
import Scene from '../lib/engine/Scene';
import Vector2 from '../lib/engine/types/Vector2';

class DummyRect extends GameObject {
    // constructor() {
    //     super();


    // }

    render() {
        const rect = new Graphics();

        rect
            .beginFill(0x0000ff)
            .drawCircle(0,0, 10);

        return rect;
    }
}

class MainScene extends Scene {
    dummyRect?: DummyRect;

    onUpdate(deltaTime: number): void {
        const rec = this.dummyRect;
        if (rec === undefined) return;

        rec.transform.position.x += 1 * deltaTime;
    }

    onStart(): void {
        this.dummyRect = new DummyRect();

        this.dummyRect.transform.position = new Vector2(100, 100);
        this.dummyRect.transform.scale = new Vector2(10, 10);

        this.instantiate(this.dummyRect);
    }
}

const GameCanvas: React.FC = () => {
    // Create a ref to the below div
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const app = new Application({
            width: window.innerWidth,
            height: window.innerHeight,

            backgroundColor: 0x5BBA6F,
        });

        const rect = new Graphics()
            .beginFill(0xff0000)
            .drawRect(100, 100, 100, 100);

        app.stage.addChild(rect);

        // Add the canvas to the DOM
        ref.current?.appendChild(app.view);

        new MainScene(app);

        // Start the PixiJS app
        app.start();

        return () => {
            // On unload completely destroy the application and all of it's children
            app.destroy(true, true);
        };
    }, []);

    return (
        <div ref={ref} />
    );
}

export default GameCanvas;