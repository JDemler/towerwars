import GameClient from "@game/GameClient";
import { GamePhase, GameState, MobTypeModel, PlayerModel, TowerTypeModel, BarracksModel, TowerModel } from '@models';

export interface InitialUiState {
    gameClient?: GameClient;

    gameState?: GameState;
    gamePhase?: GamePhase;

    playerModel?: PlayerModel;

    mobTypes?: MobTypeModel[];
    towerTypes?: TowerTypeModel[];
    barracksModel?: BarracksModel;

    setSelectedTowerType?: (towerType: string) => void;
    selectedTowerTypeKey?: string;

    selectedTower?: TowerModel;
}

export default interface UiState extends InitialUiState {
    gameClient: GameClient;
}