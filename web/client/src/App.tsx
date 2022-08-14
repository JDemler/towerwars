import './App.css';
import { Layer, Stage } from 'react-konva';
import BackgroundLayer from './ui/background/BackgroundLayer';
import Turret from './ui/entities/Turret';
import GridCoordinate from './lib/GridCoordinate';
import Mob from './ui/entities/Mob';

function App() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <BackgroundLayer width={10} height={10} />
      <Layer>
        <Turret coordinate={new GridCoordinate(0, 0)} />
        <Turret coordinate={new GridCoordinate(2, 1)} />
        <Turret coordinate={new GridCoordinate(5, 5)} />

        <Mob coordinate={new GridCoordinate(4, 4)} />
      </Layer>
    </Stage>
  );
}

export default App;
