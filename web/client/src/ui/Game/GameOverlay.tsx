import { useUiState } from "@hooks";
import { MobSlotModel, MobTypeModel } from "@models";

const GameOverlay: React.FC = () => {
    const [uiState] = useUiState();

    const { playerModel, towerTypes, mobTypes, barracksModel, selectedTowerTypeKey } = uiState;

    const mobSlots = barracksModel?.mobSlots;
    
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
            <div style={{ position: 'fixed', bottom: '16px', width: '100%' }}>
                <h4 style={{ textAlign: 'center' }}>Select your tower:</h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    { towerTypes === undefined || playerModel === undefined ? (
                        <p>Loading Mob types...</p>
                    ) : towerTypes.map((towerType) => (
                        <input 
                            type="button"
                            key={towerType.key}
                            value={`${towerType.name} ${towerType.levels[0].cost}€`}
                            title={`${towerType.description} (${towerType.levels[0].damage} damage, Fire Rate: ${towerType.levels[0].fireRate})`}
                            onClick={() => uiState.setSelectedTowerType?.(towerType.key)} 
                            style={{ margin: '0 2px', padding: '4px', backgroundColor: selectedTowerTypeKey === towerType.key ? 'lightblue' : undefined }}
                            disabled={playerModel.money < towerType.levels[0].cost}
                        />
                    ))}
                </div>
                <h4 style={{ textAlign: 'center', marginTop: '8px' }}>Send Mobs to the battleground:</h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
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
        </div>
    );
}

export default GameOverlay;