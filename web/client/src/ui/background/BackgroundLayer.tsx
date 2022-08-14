import { Layer } from "react-konva";
import GridCoordinate from "../../lib/GridCoordinate";
import BackgroundTile from "./BackgroundTile";

export interface BackgroundProps {
    width: number;
    height: number;
}


// React component that draws a single 1x1 rect based on the given GridCoordinate. 
// The fill color is determined by the coordinate in a chessboard pattern.
const BackgroundLayer: React.FC<BackgroundProps> = ({ width, height }) => {
    
    // Return BackgroundTile for each tile in the grid based on the width and height of the background
    const tiles = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            tiles.push(<BackgroundTile coordinate={new GridCoordinate(x, y)} />);
        }
    }

    return <Layer>{tiles}</Layer>;
}

export default BackgroundLayer;