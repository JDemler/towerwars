import { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';

export interface LobbySceneProps {

}

const LobbyScene: React.FC<LobbySceneProps> = () => {
    const { gameState, joinGame } = useGameState();
    
    const [playerName, setPlayerName] = useState('');

    if (!gameState) 
      return <></>;

    return (
        <div style={{ height: '100vh' }}>
            <h1>Welcome :)</h1>
            <p>Waiting for players: {gameState.fields.length} / 2</p>
            <p>Press the join button to join a game!</p>
            {/* Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={{ width: '200px', marginRight: '16px' }} />
                <input type="button" value="Join Game" onClick={() => joinGame(playerName)} />
            </div>
        </div>
    );

}

export default LobbyScene;