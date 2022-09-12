import GameClient from "@game/GameClient";
import { GamePhase, GameState, MobTypeModel, PlayerModel, TowerTypeModel, BarracksModel } from '@models';

export interface InitialUiState {
    gameClient: GameClient | undefined;

    gameState: GameState | undefined;
    gamePhase: GamePhase | undefined;

    mobTypes: MobTypeModel[] | undefined;
    towerTypes: TowerTypeModel[] | undefined;
    barracksModel: BarracksModel | undefined;

    playerModel: PlayerModel | undefined;
}

export default interface UiState extends InitialUiState {
    gameClient: GameClient;
}