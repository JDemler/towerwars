import { useUiState } from "@hooks";
import MatchmakingPage from "@ui/MatchmakingPage/MatchmakingPage";
import GamePage from '@ui/Game/GamePage';

const Router: React.FC = () => {
    const [uiState] = useUiState();

    switch (uiState.gamePhase) {
        case undefined:
            return <div>Loading...</div>;
        case 'NotJoined':
        case 'WaitingForPlayers':
            return <MatchmakingPage />;
        case 'Playing':
            return <GamePage />;
        case 'GameOver':
            return <div>Game Over</div>;
        default:
            return <div>Unknown Game Phase</div>;
    }
}

export default Router;