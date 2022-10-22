import { GridSettings } from "@grid";

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

    moveTo(targetCoordinate: GridCoordinate, speed: number, deltaMs: number) {
        const distanceX = targetCoordinate.x - this.x;
        const distanceY = targetCoordinate.y - this.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
        const distancePerMillisecond = speed / 1000;
    
        const moveDistance = distancePerMillisecond * deltaMs;
        
        if (moveDistance > distance) {
            return new GridCoordinate(targetCoordinate.x, targetCoordinate.y);
        }
    
        return new GridCoordinate(
            this.x + (distanceX / distance) * moveDistance,
            this.y + (distanceY / distance) * moveDistance,
        );
    }

    equals(other: GridCoordinate) {
        return this.x === other.x && this.y === other.y;
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