import { useUiState } from "@hooks";

const GameOverlay: React.FC = () => {
    const [uiState] = useUiState();
    
    return (
        <div>
            <div style={{ position: 'fixed', top: '16px', left: '16px', pointerEvents: 'none' }}>
                <h4>{uiState.playerModel?.name}</h4>
                <p>Money: {uiState.playerModel?.money}</p>
                <p>Income: {uiState.playerModel?.income}</p>
                <p>HP: {uiState.playerModel?.lives}</p>

            </div>
            {/* Game Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input type="button" value="Buy Mob" onClick={() => uiState.gameClient.buyMob()} />
            </div>
        </div>
    );
}

export default GameOverlay;