import { useGameStateOpt } from "../../hooks/useGameState";
import LobbyScene from "./LobbyScene";
import GameScene from './GameScene';

const SceneManager: React.FC = () => {
    const gameState = useGameStateOpt();

    // console.log('GameState: ', gameState, gameState?.state);

    if (gameState?.gameState === undefined) {
        return <div>Loading...</div>;
    }

    switch (gameState.gameState.state) {
        case 'WaitingForPlayers':
            return <LobbyScene />;
        case 'Playing':
            return <GameScene />;
        case 'GameOver':
            return <div>Game Over</div>;
        default:
            return <div>Unknown game state</div>;
    }
}

export default SceneManager;