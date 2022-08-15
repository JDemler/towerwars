import './App.css';
import { getGameState, joinGame, registerEvent } from './lib/Client';
import { useEffect, useState } from 'react';
import GameState from './ui/models/GameState';
import Field from './ui/stages/Field';
import { BuyMobEvent, BuildTurretEvent } from './lib/FieldEvent';
import GridCoordinate from './lib/GridCoordinate';

function App() {

  const [gameState, setGameState] = useState<GameState>();
  const [playerId, setPlayerId] = useState<number>();
  const [enemyId, setEnemyId] = useState<number>();

  // GameLoop
  // TODO: Use blocking call to getGameState() to avoid rendering while waiting for response.
  useEffect(() => {
    const interval = setInterval(() => {
      getGameState()
        .then(gameState => {
          // console.log(gameState)
          setGameState(gameState);
        }).catch(err => {
          console.error('Error while fetching gameState', err);
        })
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Join the game and assign the playerId
  const join = () => {
    joinGame()
      .then(playerId => {
        setPlayerId(playerId);
        setEnemyId(1 - playerId);
      }).catch(err => {
        console.error('Error while joining game', err);
      })
  }

  const buyMob = () => {
    if (playerId === undefined || enemyId === undefined) {
      return console.error('Not a player');
    }
    registerEvent(new BuyMobEvent(playerId, enemyId, 'Circle'));
  }

  const buildTurret = (coordinate: GridCoordinate) => {
    if (playerId === undefined) {
      return console.error('Not a player');
    }
    registerEvent(new BuildTurretEvent(playerId, coordinate.x, coordinate.y, 'Arrow'));
  }

  if (!gameState) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ height: '100vh' }}>
      {/* Fields */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignContent: 'space-evenly', height: '100%' }}>
        {gameState.fields.map(field => 
          <div key={field.id} style={{margin: '8px'}}>
            <Field field={field} onTileClick={coordinate => { console.log('tile clicked', coordinate); buildTurret(coordinate)}} />
          </div>
        )}
      </div>
      
      {/* Action Bar */}
      <div style={{ position: 'fixed', bottom: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <input type="button" value="Join Game" onClick={() => join()} />
        <input type="button" value="Buy Mob" onClick={() => buyMob()} />
        {/* <input type="button" value="Build Turret" onClick={() => buildTurret(new GridCoordinate(1, 1))} /> */}
      </div>
    </div>
  )
}

export default App;
