import { Circle } from 'react-konva';
import GridCoordinate from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';

export interface BulletProps {
    coordinate: GridCoordinate;
}

// React component that draws a single 1x1 rect based on the given GridCoordinate. 
// The fill color is determined by the coordinate in a chessboard pattern.
const Bullet: React.FC<BulletProps> = ({ coordinate }) => {
    const size = new GridSize(0.2, 0.2);

    return <Circle x={coordinate.tileCenterX} y={coordinate.tileCenterY} width={size.tileWidth} height={size.tileHeight} fill="red" />;
}

export default Bullet;