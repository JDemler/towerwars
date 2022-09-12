import { useUiState } from "@hooks";
import { MobSlotModel, MobTypeModel } from "@models";

const GameOverlay: React.FC = () => {
    const [uiState] = useUiState();
    
    const playerModel = uiState.playerModel;

    const mobTypes = uiState.mobTypes;
    const mobSlots = uiState.barracksModel?.mobSlots;
    
    let mobSlotsWithMobTypes: {[x: string]: [MobTypeModel, MobSlotModel]} | undefined = undefined;

    if (mobSlots !== undefined && mobTypes !== undefined) {
        mobSlotsWithMobTypes = {};
        for (const mobSlot of mobSlots) {
            const mobType = mobTypes.find((mobType) => mobType.key === mobSlot.mobKey);

            if (mobType !== undefined) {
                mobSlotsWithMobTypes[mobSlot.mobKey] = [mobType, mobSlot];
            }
        }
    }

    return (
        <div>
            {/* Player Info */}
            <div style={{ position: 'fixed', top: '16px', left: '16px', pointerEvents: 'none' }}>
                <h4>{playerModel?.name}</h4>
                <p>Money: {playerModel?.money}</p>
                <p>Income: {playerModel?.income}</p>
                <p>HP: {playerModel?.lives}</p>
            </div>

            {/* Game Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                { mobSlotsWithMobTypes === undefined || playerModel === undefined ? (
                    <p>Loading Mob types...</p>
                ) : Object.values(mobSlotsWithMobTypes).map(([mobType, mobSlot]) => (
                    <input 
                        type="button"
                        key={mobType.key}
                        value={`${mobType.name} ${mobType.cost}€ (${mobSlot.count})`}
                        title={`${mobType.description} (${mobType.health} HP, Delay: ${mobType.delay})`}
                        onClick={() => uiState.gameClient.buyMob(mobType.key)} 
                        style={{ margin: '0 2px', padding: '4px' }}
                        disabled={mobSlot.count === 0 || playerModel.money < mobType.cost}
                    />
                ))}
            </div>
        </div>
    );
}

export default GameOverlay;