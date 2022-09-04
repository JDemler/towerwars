import { Application } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import beginGameLoop from "../../game/stage";
import { useUiState } from "../../hooks/useUiState";

const GameCanvas: React.FC = () => {
    // Create a ref to the below div
    const ref = useRef<HTMLDivElement>(null);
    const [playerName, setPlayerName] = useState('');
    const [uiState, dispatchUiState] = useUiState();
    const [initialGameState] = useState(uiState!.gameState!);
    const [gameClient] = useState(uiState!.gameClient);
    
    useEffect(() => {
        const app = new Application({
            resizeTo: window,

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

    return <>
        <div ref={ref} />
        <div>
            {/* Join Game Action Bar */}
            <div style={{ position: 'fixed', bottom: '48px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={{ width: '200px', marginRight: '16px' }} />
                <input type="button" value="Join Game" onClick={() => gameClient?.joinGame(playerName)} />
            </div>

            {/* Game Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input type="button" value="Buy Mob" onClick={() => gameClient?.buyMob()} />
            </div>
        </div>
    </>
}

export default GameCanvas;