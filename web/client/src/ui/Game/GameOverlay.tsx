import { useState } from "react";
import { useUiState } from "../../hooks/useUiState";

const GameOverlay: React.FC = () => {
    const [uiState] = useUiState();
    const [playerName, setPlayerName] = useState('');

    if (!uiState) {
        return <div>Loading...</div>;
    }
    
    return (
        <div>
            {/* Game Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input type="button" value="Buy Mob" onClick={() => uiState.gameClient.buyMob()} />
            </div>
        </div>
    );
}

export default GameOverlay;