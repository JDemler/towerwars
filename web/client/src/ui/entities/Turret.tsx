import { Circle } from 'react-konva';
import GridCoordinate from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';

export interface TurretProps {
    coordinate: GridCoordinate;
}


// React component that draws a single 1x1 rect based on the given GridCoordinate. 
// The fill color is determined by the coordinate in a chessboard pattern.
const Turret: React.FC<TurretProps> = ({ coordinate }) => {
    const size = new GridSize(0.8, 0.8);
    
    return <Circle x={coordinate.tileCenterX} y={coordinate.tileCenterY} width={size.tileWidth} height={size.tileHeight} fill="white" />;
}

export default Turret;