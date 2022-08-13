import { Rect } from 'react-konva';
import GridCoordinate from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';

export interface BackgroundTileProps {
    coordinate: GridCoordinate;
}


// React component that draws a single 1x1 rect based on the given GridCoordinate. 
// The fill color is determined by the coordinate in a chessboard pattern.
const BackgroundTile: React.FC<BackgroundTileProps> = ({ coordinate }) => {
    const size = new GridSize(1, 1);

    // Determine the fill color based on the coordinate in a chessboard pattern.
    const isPrimaryColor = (coordinate.x + coordinate.y) % 2 === 0;
    
    return <Rect x={coordinate.tileX} y={coordinate.tileY} width={size.tileWidth} height={size.tileHeight} fill={isPrimaryColor ? '#00BA06' : '#018901'} />;
}

export default BackgroundTile;