import GameClient from "@game/GameClient";
import { GamePhase, GameState, PlayerModel } from '@models';

export interface InitialUiState {
    gameClient: GameClient | undefined;

    gameState: GameState | undefined;
    gamePhase: GamePhase | undefined;

    mobTypes: string[] | undefined;
    towerTypes: string[] | undefined;

    playerModel: PlayerModel | undefined;
}

export default interface UiState extends InitialUiState {
    gameClient: GameClient;
}