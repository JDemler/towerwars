import GridCoordinate from "./GridCoordinate";
import { GridSettings } from "./GridSettings";

// Class which has a width and height and can calculate the difference between two GridCoordinates.
export class GridSize {
    width: number;
    height: number;

    tileWidth: number;
    tileHeight: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.tileWidth = this.width * GridSettings.tileSize;
        this.tileHeight = this.height * GridSettings.tileSize;
    }
    
    // Returns the difference between two GridCoordinates.
    static getDifference(coordinate1: GridCoordinate, coordinate2: GridCoordinate): GridCoordinate {
        return new GridCoordinate(coordinate2.x - coordinate1.x, coordinate2.y - coordinate1.y);
    }
}
