import GridCoordinate from '../lib/GridCoordinate';
import { GridSize } from '../lib/GridSize';

interface MapModel {
    size: GridSize;
    start: GridCoordinate;
    end: GridCoordinate;
    tiles: { x: number; y: number; }[];
}

namespace MapModel {
    export function fromJSON(json: any): MapModel {
        return {
            size: new GridSize(json.width, json.height),
            start: new GridCoordinate(json.xstart, json.ystart),
            end: new GridCoordinate(json.xend, json.yend),
            tiles: json.tiles,
        };
    }
}

export default MapModel;