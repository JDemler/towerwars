import { Application, Graphics } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import GameClient from "../../game/GameClient";
import beginGameLoop from "../../game/stage";
import GridCoordinate from "../../lib/GridCoordinate";

const GameCanvas: React.FC = () => {
    // Create a ref to the below div
    const ref = useRef<HTMLDivElement>(null);
    const [gameClient, setGameClient] = useState<GameClient>();
    const [playerName, setPlayerName] = useState('');
    
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

        const gameLoop = beginGameLoop(app);

        setGameClient(gameLoop.gameClient);

        return () => {
            // On unload completely destroy the application and all of it's children
            app.destroy(true, true);

            gameLoop.end();
        };
    }, []);

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
                <input type="button" value="Buy Tower" onClick={() => gameClient?.buildTurret(new GridCoordinate(3, 3))} />
            </div>
        </div>
    </>
}

export default GameCanvas;