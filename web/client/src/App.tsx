import './App.css';
import { Layer, Stage, Text } from 'react-konva';

function App() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text x={16} y={16} text="Hello World!" />
      </Layer>
    </Stage>
  );
}

export default App;
