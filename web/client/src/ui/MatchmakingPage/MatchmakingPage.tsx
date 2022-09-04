import { useState } from "react";
import { useUiState } from "../../hooks/useUiState";

const MatchmakingPage: React.FC = () => {
    const [uiState] = useUiState();
    const [playerName, setPlayerName] = useState('');

    if (!uiState) {
        return <div>Loading...</div>;
    }
    
    return (
        <div style={{ padding: '16px' }}>
            <h1>Welcome to socialmediawars.io!</h1>

            {/* Join Game Action Bar */}
            <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={{ width: '200px', marginRight: '16px' }} />
            <input type="button" value="Join Game" onClick={() => uiState.gameClient.joinGame(playerName)} />
        </div>
    );
}

export default MatchmakingPage;