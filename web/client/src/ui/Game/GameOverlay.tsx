import { useUiState } from "@hooks";

const GameOverlay: React.FC = () => {
    const [uiState] = useUiState();

    const mobTypes = uiState.mobTypes;
    
    return (
        <div>
            {/* Player Info */}
            <div style={{ position: 'fixed', top: '16px', left: '16px', pointerEvents: 'none' }}>
                <h4>{uiState.playerModel?.name}</h4>
                <p>Money: {uiState.playerModel?.money}</p>
                <p>Income: {uiState.playerModel?.income}</p>
                <p>HP: {uiState.playerModel?.lives}</p>
            </div>

            {/* Game Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                { mobTypes === undefined ? (
                    <p>Loading Mob types...</p>
                ) : mobTypes.map((mobType) => (
                    <input 
                        type="button"
                        key={mobType.key}
                        value={`${mobType.name} (${mobType.cost})`}
                        title={`${mobType.description} (${mobType.health} HP, Delay: ${mobType.delay})`}
                        onClick={() => uiState.gameClient.buyMob(mobType.key)} 
                        style={{ margin: '0 2px', padding: '4px' }}
                    />
                ))}
            </div>
        </div>
    );
}

export default GameOverlay;