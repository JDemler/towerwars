import { useGameState } from '../../hooks/useGameState';

export interface LobbySceneProps {

}

const LobbyScene: React.FC<LobbySceneProps> = () => {
    const { gameState, joinGame } = useGameState();
    
    if (!gameState) 
      return <></>;

    return (
        <div style={{ height: '100vh' }}>
            <h1>Welcome :)</h1>
            <p>Waiting for players: {gameState.fields.length} / 2</p>
            <p>Press the join button to join a game!</p>
            {/* Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input type="button" value="Join Game" onClick={() => joinGame()} />
            </div>
        </div>
    );

}

export default LobbyScene;