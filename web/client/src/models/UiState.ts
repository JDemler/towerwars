import GameClient from '../game/GameClient';
import GamePhase from './GamePhase';
import GameState from './GameState';
import PlayerModel from './PlayerModel';

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