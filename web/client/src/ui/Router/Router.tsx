import { useUiState } from "../../hooks/useUiState";
import GameCanvas from '../GameCanvas/GameCanvas';
import MatchmakingPage from "../MatchmakingPage/MatchmakingPage";

const Router: React.FC = () => {
    const [uiState] = useUiState();
    
    switch (uiState.gamePhase) {
        case undefined:
            return <div>Loading...</div>;
        case 'WaitingForPlayers':
            return <MatchmakingPage />;
        case 'Playing':
            return <GameCanvas />;
        case 'GameOver':
            return <div>Game Over</div>;
        default:
            return <div>Unknown Game Phase</div>;
    }
}

export default Router;