import { Layer } from "react-konva";
import GridCoordinate from "../../lib/GridCoordinate";
import BackgroundTile from "./BackgroundTile";

export interface BackgroundProps {
    width: number;
    height: number;

    onTileClick?: (coordinate: GridCoordinate) => void;
}

const BackgroundLayer: React.FC<BackgroundProps> = ({ width, height, onTileClick }) => {
    
    // Return BackgroundTile for each tile in the grid based on the width and height of the background
    const tiles = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            tiles.push(<BackgroundTile key={`${x},${y}`} coordinate={new GridCoordinate(x, y)} onClick={() => onTileClick && onTileClick(new GridCoordinate(x, y))} />);
        }
    }

    return <Layer>{tiles}</Layer>;
}

export default BackgroundLayer;