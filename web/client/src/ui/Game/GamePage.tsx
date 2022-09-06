import GameCanvas from "./GameCanvas"
import GameOverlay from "./GameOverlay"

const GamePage: React.FC = () => {
    return (<>
        <GameCanvas />
        <GameOverlay />
    </>)
}

export default GamePage;