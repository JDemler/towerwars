import { Application, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";

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