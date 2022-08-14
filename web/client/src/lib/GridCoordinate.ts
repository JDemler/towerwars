import { GridSettings } from "./GridSettings";

// Defines a potion on the grid
export default class GridCoordinate {
    x: number;
    y: number;

    tileX: number;
    tileY: number;

    tileCenterX: number;
    tileCenterY: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.tileX = this.x * GridSettings.tileSize;
        this.tileY = this.y * GridSettings.tileSize;

        this.tileCenterX = this.tileX + GridSettings.tileSize / 2;
        this.tileCenterY = this.tileY + GridSettings.tileSize / 2;
    }
}