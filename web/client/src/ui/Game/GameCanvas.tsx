import { Application } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import beginGameLoop from "@game/stage";
import { useUiState } from "@hooks";

const GameCanvas: React.FC = () => {
    // Create a ref to the below div
    const ref = useRef<HTMLDivElement>(null);
    const [uiState, dispatchUiState] = useUiState();
    const [initialGameState] = useState(uiState!.gameState);
    const [gameClient] = useState(uiState!.gameClient);
    
    useEffect(() => {
        const app = new Application({
            resizeTo: window,
            resolution: window.devicePixelRatio,
            antialias: true,

            backgroundColor: 0x50a161,
        });

        // Add the canvas to the DOM
        ref.current?.appendChild(app.view);
        
        const resizeObserver = new ResizeObserver(() => {
            app.render();
        });

        resizeObserver.observe(app.view);

        // Start the PixiJS app
        app.start();

        beginGameLoop(app, initialGameState, gameClient, dispatchUiState);

        return () => {
            resizeObserver.disconnect();

            // On unload completely destroy the application and all of it's children
            app.destroy(true, true);
        }; 
    }, [dispatchUiState, gameClient, initialGameState]);

    return (
        <div ref={ref} />
    );
}

export default GameCanvas;