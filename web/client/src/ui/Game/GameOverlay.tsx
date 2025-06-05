import { useUiState } from "@hooks";
import { useState, useEffect } from "react";
import { MobSlotModel, MobTypeModel } from "@models";

const GameOverlay: React.FC = () => {
  const [uiState] = useUiState();

  const {
    gameClient,
    playerModel,
    towerTypes,
    mobTypes,
    barracksModel,
    selectedTowerTypeKey,
    selectedTower,
  } = uiState;

  const [incomeCooldown, setIncomeCooldown] = useState<number | undefined>(
    uiState.gameState?.incomeCooldown
  );

  useEffect(() => {
    setIncomeCooldown(uiState.gameState?.incomeCooldown);
  }, [uiState.gameState?.incomeCooldown]);

  useEffect(() => {
    if (incomeCooldown === undefined) return;
    const interval = setInterval(() => {
      setIncomeCooldown((prev) =>
        prev !== undefined ? Math.max(prev - 0.1, 0) : prev
      );
    }, 100);
    return () => clearInterval(interval);
  }, [incomeCooldown]);

  const selectedTowerType = towerTypes?.find(
    (t) => t.key === selectedTower?.type
  );
  const selectedTowerNextLevel =
    selectedTower !== undefined &&
    selectedTowerType !== undefined &&
    selectedTower?.level < selectedTowerType?.levels.length
      ? selectedTowerType?.levels[selectedTower.level]
      : undefined;

  const [activeTab, setActiveTab] = useState<'towers' | 'mobs'>('towers');

  const mobSlots = barracksModel?.mobSlots;

  let mobSlotsWithMobTypes:
    | { [x: string]: [MobTypeModel, MobSlotModel] }
    | undefined = undefined;

  if (mobSlots !== undefined && mobTypes !== undefined) {
    mobSlotsWithMobTypes = {};
    for (const mobSlot of mobSlots) {
      const mobType = mobTypes.find(
        (mobType) => mobType.key === mobSlot.mobKey
      );

      if (mobType !== undefined) {
        mobSlotsWithMobTypes[mobSlot.mobKey] = [mobType, mobSlot];
      }
    }
  }

  return (
    <div>
      {/* Top resource bar */}
      <div className="fixed top-0 left-0 right-0 flex justify-center gap-8 p-2 bg-slate-800/90 text-white shadow">
        <div className="flex items-center gap-1">
          <span role="img" aria-label="income">📈</span>
          {playerModel?.income}
        </div>
        <div className="flex items-center gap-1">
          <span role="img" aria-label="cooldown">⏳</span>
          {incomeCooldown !== undefined ? incomeCooldown.toFixed(1) : '-'}s
        </div>
        <div className="flex items-center gap-1">
          <span role="img" aria-label="money">🪙</span>
          {playerModel?.money}
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl bg-slate-900/80 text-white rounded-t-lg shadow-lg">
          <div className="flex justify-center space-x-6 border-b border-slate-700">
            <button
              className={`p-2 ${activeTab === 'towers' ? 'border-b-2 border-smw-orange-500' : ''}`}
              onClick={() => setActiveTab('towers')}
            >
              Towers
            </button>
            <button
              className={`p-2 ${activeTab === 'mobs' ? 'border-b-2 border-smw-orange-500' : ''}`}
              onClick={() => setActiveTab('mobs')}
            >
              Mobs
            </button>
          </div>
          <div className="p-3 flex justify-center flex-wrap">
            {activeTab === 'towers' && (
              <>
                {towerTypes === undefined || playerModel === undefined ? (
                  <p>Loading tower types...</p>
                ) : (
                  towerTypes.map((towerType) => (
                    <button
                      key={towerType.key}
                      className={`relative w-16 h-16 m-1 border-2 rounded shadow ${
                        selectedTowerTypeKey === towerType.key ? 'border-smw-orange-500' : 'border-black'
                      } ${playerModel.money < towerType.levels[0].cost ? 'cursor-not-allowed opacity-50' : ''}`}
                      title={`${towerType.description} (${towerType.levels[0].damage} damage, Fire Rate: ${towerType.levels[0].fireRate})`}
                      onClick={() => uiState.setSelectedTowerType?.(towerType.key)}
                      disabled={playerModel.money < towerType.levels[0].cost}
                    >
                      <img
                        src={`assets/towerSprites/${towerType.key}.png`}
                        alt={`${towerType.name} Thumbnail`}
                        className="w-16 h-16"
                      />
                      <span className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-1">
                        {towerType.levels[0].cost}€
                      </span>
                    </button>
                  ))
                )}
              </>
            )}
            {activeTab === 'mobs' && (
              <>
                {mobSlotsWithMobTypes === undefined || playerModel === undefined ? (
                  <p>Loading mob types...</p>
                ) : (
                  Object.values(mobSlotsWithMobTypes).map(([mobType, mobSlot]) => (
                    <button
                      key={mobType.key}
                      className={`relative w-16 h-16 m-1 border-2 rounded shadow ${
                        mobSlot.count === 0 || playerModel.money < mobType.cost ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      onClick={() => gameClient.buyMob(mobType.key)}
                      disabled={mobSlot.count === 0 || playerModel.money < mobType.cost}
                      title={`${mobType.description} (${mobType.health} HP, Delay: ${mobType.delay})`}
                    >
                      <img
                        src={`assets/mobSprites/${mobType.key}.png`}
                        alt={`${mobType.name} Thumbnail`}
                        className="w-16 h-16"
                      />
                      <span className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-1">
                        {mobSlot.count}
                      </span>
                      <span className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1">
                        {mobType.cost}€
                      </span>
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selected tower actions */}
      {selectedTower !== undefined && playerModel !== undefined && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center">
          <div className="bg-slate-800/90 p-2 rounded shadow text-white flex space-x-2">
            <button
              className="px-2 py-1 bg-smw-yellow-500 rounded disabled:opacity-50"
              onClick={() => gameClient.upgradeTurret(selectedTower)}
              disabled={
                selectedTowerNextLevel === undefined ||
                playerModel.money < selectedTowerNextLevel.cost
              }
            >
              {selectedTowerNextLevel !== undefined
                ? `Upgrade (${selectedTowerNextLevel.cost}€)`
                : 'Max Level'}
            </button>
            <button
              className="px-2 py-1 bg-smw-orange-500 rounded"
              onClick={() => gameClient.sellTurret(selectedTower)}
            >
              Sell
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameOverlay;
