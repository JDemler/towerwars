import { useUiState } from "@hooks";
import { MobSlotModel, MobTypeModel } from "@models";

const GameOverlay: React.FC = () => {
    const [uiState] = useUiState();

    const { gameClient, playerModel, towerTypes, mobTypes, barracksModel, selectedTowerTypeKey, selectedTower } = uiState;

    const selectedTowerType = towerTypes?.find(t => t.key === selectedTower?.type);
    const selectedTowerNextLevel = selectedTower !== undefined && selectedTowerType !== undefined && selectedTower?.level < selectedTowerType?.levels.length 
        ? selectedTowerType?.levels[selectedTower.level] 
        : undefined;

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
            {playerModel !== undefined && (
            <div style={{ position: 'fixed', top: '16px', left: '16px', pointerEvents: 'none' }}>
                <h4>{playerModel?.name}</h4>
                <p>Money: {playerModel?.money}</p>
                <p>Income: {playerModel?.income}</p>
                <p>HP: {playerModel?.lives}</p>
            </div>
            )}
            {/* Game Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%' }}>
                {selectedTower !== undefined && playerModel !== undefined && (
                    <>
                        <h4 style={{ textAlign: 'center' }}>1 Tower selected:</h4>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input 
                                type="button"
                                value={selectedTowerNextLevel !== undefined
                                    ? `Upgrade (${selectedTowerNextLevel.cost}€)` 
                                    : 'Max Level'
                                }
                                onClick={() => gameClient.upgradeTurret(selectedTower)}
                                style={{ margin: '0 2px', padding: '4px' }}
                                disabled={selectedTowerNextLevel === undefined || playerModel.money < selectedTowerNextLevel.cost}
                            />
                            <input 
                                type="button"
                                value={'Sell'}
                                onClick={() => gameClient.sellTurret(selectedTower)}
                                style={{ margin: '0 2px', padding: '4px' }}
                            />
                        </div>
                    </>
                )}
<div className="flex flex-col shrink items-start ml-9">
    <div className="flex p-4 shrink  bg-gray-900/25">
    <h4 className="text-left mb-2 block self-center text-white bold px-3">Towers</h4>
        
        {towerTypes === undefined || playerModel === undefined ? (
            <p>Loading Mob types...</p>
        ) : towerTypes.map((towerType) => (
            <button 
                key={towerType.key}
                className={`w-16 h-16 py-2 px-3 mx-1 text-sm border-2 ${selectedTowerTypeKey === towerType.key ? 'bg-lightblue' : 'border-black'} ${playerModel.money < towerType.levels[0].cost ? 'cursor-not-allowed' : ''}`}
                title={`${towerType.description} (${towerType.levels[0].damage} damage, Fire Rate: ${towerType.levels[0].fireRate})`}
                onClick={() => uiState.setSelectedTowerType?.(towerType.key)}
                disabled={playerModel.money < towerType.levels[0].cost}
            >
                <img src={`assets/towerSprites/${towerType.key}.png`} alt={`${towerType.name} Thumbnail`} className="w-16 h-16" />
                {/* <span>{towerType.name} {towerType.levels[0].cost}€</span> */}
            </button>
        ))}
    </div>
</div>



                <h4 style={{ textAlign: 'center', marginTop: '8px' }}>Send Mobs to the battleground:</h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    { mobSlotsWithMobTypes === undefined || playerModel === undefined ? (
                        <p>Loading Mob types...</p>
                    ) : Object.values(mobSlotsWithMobTypes).map(([mobType, mobSlot]) => (
                        <div>
                        <input 
                            type="button"
                            key={`${mobType.key}_upgrade`}
                            value={`Upgrade ${mobType.cost * 100}€`}                            
                            onClick={() => gameClient.upgradeMobType(mobType.key)} 
                            style={{ margin: '0 2px', padding: '4px' }}
                            disabled={playerModel.money < mobType.cost * 100}
                        />
                        <input 
                            type="button"
                            key={mobType.key}
                            value={`${mobType.name} ${mobType.cost}€ (${mobSlot.count})`}
                            title={`${mobType.description} (${mobType.health} HP, Delay: ${mobType.delay})`}
                            onClick={() => gameClient.buyMob(mobType.key)} 
                            style={{ margin: '0 2px', padding: '4px' }}
                            disabled={mobSlot.count === 0 || playerModel.money < mobType.cost}
                        />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GameOverlay;