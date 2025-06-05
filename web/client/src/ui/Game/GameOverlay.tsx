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
      {/* Game Action Bar */}
      <div style={{ position: "fixed", bottom: "16px", width: "100%" }}>
        {selectedTower !== undefined && playerModel !== undefined && (
          <>
            <h4 style={{ textAlign: "center" }}>1 Tower selected:</h4>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <input
                type="button"
                value={
                  selectedTowerNextLevel !== undefined
                    ? `Upgrade (${selectedTowerNextLevel.cost}€)`
                    : "Max Level"
                }
                onClick={() => gameClient.upgradeTurret(selectedTower)}
                style={{ margin: "0 2px", padding: "4px" }}
                disabled={
                  selectedTowerNextLevel === undefined ||
                  playerModel.money < selectedTowerNextLevel.cost
                }
              />
              <input
                type="button"
                value={"Sell"}
                onClick={() => gameClient.sellTurret(selectedTower)}
                style={{ margin: "0 2px", padding: "4px" }}
              />
            </div>
          </>
        )}
        <div className="flex my-5">
          <div className="flex flex-col shrink items-start ml-9 w-1/2">
            <div className="flex p-4 shrink bg-gray-900/25">
              <h4 className="text-left mb-2 block self-center text-white bold px-3">
                Towers
              </h4>

              {towerTypes === undefined || playerModel === undefined ? (
                <p>Loading Mob types...</p>
              ) : (
                towerTypes.map((towerType) => (
                  <button
                    key={towerType.key}
                    className={`relative w-16 h-16 py-2 px-3 mx-1 text-sm border-2 ${
                      selectedTowerTypeKey === towerType.key
                        ? "bg-lightblue"
                        : "border-black"
                    } ${
                      playerModel.money < towerType.levels[0].cost
                        ? "cursor-not-allowed"
                        : ""
                    }`}
                    title={`${towerType.description} (${towerType.levels[0].damage} damage, Fire Rate: ${towerType.levels[0].fireRate})`}
                    onClick={() =>
                      uiState.setSelectedTowerType?.(towerType.key)
                    }
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
            </div>
          </div>
          <div className="flex flex-col shrink items-start ml-9 w-1/2">
            <div className="flex p-4 shrink bg-gray-900/25">
              <h4 className="text-left mb-2 block self-center text-white bold px-3">
                Mobs
              </h4>
              {mobSlotsWithMobTypes === undefined ||
              playerModel === undefined ? (
                <p>Loading Mob types...</p>
              ) : (
                Object.values(mobSlotsWithMobTypes).map(
                  ([mobType, mobSlot]) => (
                    <button
                      key={mobType.key}
                      className={`relative w-16 h-16 p-2 mx-1 text-sm border-2 border-black`}
                      value={`${mobType.name} ${mobType.cost}€ (${mobSlot.count})`}
                      title={`${mobType.description} (${mobType.health} HP, Delay: ${mobType.delay})`}
                      onClick={() => gameClient.buyMob(mobType.key)}
                      style={{ margin: "0 2px", padding: "4px" }}
                      disabled={
                        mobSlot.count === 0 || playerModel.money < mobType.cost
                      }
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
                  )
                )
              )}
            </div>
          </div>
        </div>
        <div className="flex mx-9 text-white">
          <div className="flex flex-col items-start mb-5">
          <div className="flex flex-row justify-between w-36">
              <span className="font-semibold pr-5">Income:</span>
              <div>
              <span className="ml-4 font-semibold text-right">{playerModel?.income}</span>
              <span className="font-semibold text-right">€</span>
              </div>
            </div>
            <div className="flex flex-row justify-between w-36">
              <span className="font-semibold pr-5">Next in:</span>
              <span className="ml-4 font-semibold text-right">
                {incomeCooldown !== undefined
                  ? incomeCooldown.toFixed(1)
                  : '-'}s
              </span>
            </div>
            <div className="flex flex-row justify-between w-36">
              <span className="font-semibold pr-5">Money:</span>
              <div>
              <span className="ml-4 font-semibold text-right">{playerModel?.money}</span>
              <span className="font-semibold text-right">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
