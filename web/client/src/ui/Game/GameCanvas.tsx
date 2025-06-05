import { Application } from "pixi.js";
import { Viewport } from 'pixi-viewport';
import { useEffect, useRef, useState } from "react";
import beginGameLoop from "@game/GameEntryPoint";
import { useUiState } from "@hooks";

const GameCanvas: React.FC = () => {
    // Create a ref to the below div where the canvas is placed inside
    const ref = useRef<HTMLDivElement>(null);

    const [uiState, dispatchUiState] = useUiState();
    const [initialGameState] = useState(uiState.gameState);
    const [gameClient] = useState(uiState.gameClient);

    useEffect(() => {
        const app = new Application({
            resizeTo: window,
            resolution: window.devicePixelRatio,
            antialias: true,

            // Use a darker background so the HUD elements stand out better
            backgroundColor: 0x1e293b,
        });

        // Add the canvas to the DOM
        ref.current?.appendChild(app.view);

        // Rerender the canvas when the window is resized to prevent flickering
        const resizeObserver = new ResizeObserver(() => {
            app.render();
        });

        resizeObserver.observe(app.view);

        // Create the camera viewport
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