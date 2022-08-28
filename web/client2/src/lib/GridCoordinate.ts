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

function getDistanceBetweenTwoPoints (x1: number, y1: number, x2: number, y2: number) {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;

    const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

    return distance;
}
  
export const getDurationFromServerSpeed = (startCoordinate: GridCoordinate, targetCoordinate: GridCoordinate, speed: number) => {
    const serverDistance = getDistanceBetweenTwoPoints(
        startCoordinate.x,
        startCoordinate.y,

        targetCoordinate.y,
        targetCoordinate.x,
    );
  
    const durationInSeconds = serverDistance / speed;
  
    const durationInMs = durationInSeconds * 1000;

    return durationInMs;
}