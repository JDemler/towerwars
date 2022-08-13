import './App.css';
import { Layer, Stage, Text } from 'react-konva';
import Background from './ui/background/Background';

function App() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Background width={10} height={10} />
      <Layer>
        <Text x={16} y={16} text="Hello World!" />
      </Layer>
    </Stage>
  );
}

export default App;
