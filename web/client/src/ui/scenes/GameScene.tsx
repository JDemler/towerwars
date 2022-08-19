import { FieldModelProvider } from "../../hooks/useFieldModel";
import { useGameState } from "../../hooks/useGameState";
import Field from "../stages/Field";

export interface GameSceneProps {
}

const GameScene: React.FC<GameSceneProps> = () => {
    const { gameState, buyMob, buildTurret } = useGameState();

    console.log('<>', 'gameState', gameState);

    if (!gameState) 
      return <></>;

    return (
        <div style={{ height: '100vh' }}>
            {/* Fields */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignContent: 'space-evenly', height: '100%' }}>
                {gameState.fields.map(field =>
                    <div key={field.id} style={{ margin: '8px' }}>
                        <div>
                            <p>Lives: {field.player.lives}</p>
                            <p>Money: {field.player.money}</p>
                            <p>Income: {field.player.income}</p>
                            <FieldModelProvider fieldId={field.id}>
                                <Field onTileClick={coordinate => { console.log('tile clicked', coordinate); buildTurret(coordinate) }} />
                            </FieldModelProvider>
                        </div>
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