import GameClient from "@game/GameClient";
import { GamePhase, GameState, MobTypeModel, PlayerModel, TowerTypeModel } from '@models';

export interface InitialUiState {
    gameClient: GameClient | undefined;

    gameState: GameState | undefined;
    gamePhase: GamePhase | undefined;

    mobTypes: MobTypeModel[] | undefined;
    towerTypes: TowerTypeModel[] | undefined;

    playerModel: PlayerModel | undefined;
}

export default interface UiState extends InitialUiState {
    gameClient: GameClient;
}