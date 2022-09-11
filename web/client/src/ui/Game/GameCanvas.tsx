import { Application } from "pixi.js";
import { Viewport } from 'pixi-viewport';
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

        const viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,

            interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        // add the viewport to the stage
        app.stage.addChild(viewport)

        // activate plugins
        viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate()

        // Start the PixiJS app
        app.start();

        beginGameLoop(app, viewport, initialGameState, gameClient, dispatchUiState);

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