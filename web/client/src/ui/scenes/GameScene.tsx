import GridCoordinate from "../../lib/GridCoordinate";
import { FieldModelProvider } from "../../hooks/useFieldModel";
import { useGameState } from "../../hooks/useGameState";
import Field from "../stages/Field";

export interface GameSceneProps {
}

// React component that draws a single 1x1 rect based on the given GridCoordinate. 
// The fill color is determined by the coordinate in a chessboard pattern.
const GameScene: React.FC<GameSceneProps> = () => {
    const { gameState, buyMob, buildTurret } = useGameState();

    console.log('<>', 'gameState', gameState);

    if (!gameState) 
      return <></>;
  
    // GameLoop
    // TODO: Use blocking call to getGameState() to avoid rendering while waiting for response.
    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     ApiClient.getGameState()
    //       .then(gameState => {
    //         // console.log(gameState)
    //         setGameState(gameState);
    //       }).catch(err => {
    //         console.error('Error while fetching gameState', err);
    //       })
    //   }, 300);
  
    //   return () => clearInterval(interval);
    // }, []);
  
    // const buyMob = () => {
    //   if (playerId === undefined || enemyId === undefined) {
    //     return console.error('Not a player');
    //   }
    //   ApiClient.registerEvent(new BuyMobEvent(playerId, enemyId, 'Circle'));
    // }
  
    // const buildTurret = (coordinate: GridCoordinate) => {
    //   if (playerId === undefined) {
    //     return console.error('Not a player');
    //   }
    //   ApiClient.registerEvent(new BuildTurretEvent(playerId, coordinate.x, coordinate.y, 'Arrow'));
    // }

    return (
        <div style={{ height: '100vh' }}>
            {/* Fields */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignContent: 'space-evenly', height: '100%' }}>
                {gameState.fields.map(field =>
                    <div key={field.id} style={{ margin: '8px' }}>
                        <FieldModelProvider fieldId={field.id}>
                            <Field onTileClick={coordinate => { console.log('tile clicked', coordinate); buildTurret(coordinate) }} />
                        </FieldModelProvider>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input type="button" value="Buy Mob" onClick={() => buyMob()} />
            </div>
        </div>
    );

}

export default GameScene;