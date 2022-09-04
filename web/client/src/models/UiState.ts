import GameClient from '../game/GameClient';
import GamePhase from './GamePhase';
import GameState from './GameState';

export interface InitialUiState {
    gameClient: GameClient | undefined;

    gameState: GameState | undefined;
    gamePhase: GamePhase | undefined;

    mobTypes: string[] | undefined;
    towerTypes: string[] | undefined;
}

export default interface UiState extends InitialUiState {
    gameClient: GameClient;
}