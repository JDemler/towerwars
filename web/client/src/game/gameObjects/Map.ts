import * as PIXI from 'pixi.js';
import { GameObject, Field, IGameObjectProps } from "@gameObjects";
import { MapModel } from '@models';
import { GridSettings, GridCoordinate } from '@grid';
import { handleViewportClick } from '@helpers';

const tileSize = GridSettings.tileSize;
const pathDotLength = 6;
const pathDotSpacing = 12;
const pathDotSpeed = 0.7;

export default class Map extends GameObject {
    mapModel: MapModel;

    pathOffset: number = 0;
    tileGraphics: PIXI.Graphics[] = [];
    pathGraphics: PIXI.Graphics;

    mapContainer: PIXI.Container;

    constructor(props: IGameObjectProps, field: Field, mapModel: MapModel, isCurrentPlayer: boolean) {
        super(props);

        this.mapModel = mapModel;

        this.mapContainer = new PIXI.Container();


        if (isCurrentPlayer) {
            const borderSize = 2;

            const currentPlayerBackground = new PIXI.Graphics()
                .beginFill(0xFFFFFF)
                .drawRect(-borderSize, -borderSize, this.mapModel.size.width * tileSize + borderSize * 2, 
                    this.mapModel.size.height * tileSize + borderSize * 2)
                .endFill();

            this.mapContainer.addChild(currentPlayerBackground)
        }
        
        for (let x = 0; x < mapModel.size.width; x++) {
            for (let y = 0; y < mapModel.size.height; y++) {
                // Determine the color based on the x and y position in a checkerboard pattern
                const color = (x + y) % 2 === 0 ? 0x5BBA6F : 0x42754d;

                const tile = new PIXI.Graphics()
                    .beginFill(color)
                    .drawRect(x * tileSize, y * tileSize, tileSize, tileSize)
                    .endFill()
                    
                tile.zIndex = 0;

                tile.interactive = true;
                
                handleViewportClick(tile, this.viewport);

                tile.on('viewportClick', e => {
                    field.onTileClick(new GridCoordinate(x, y));
                });

                this.mapContainer.addChild(tile);
                
                this.tileGraphics.push(tile);
            }
        }
        // Add this code inside your loop, after the last line
        this.pathGraphics = new PIXI.Graphics();
        this.mapContainer.addChild(this.pathGraphics);

        drawPathDots(this.pathGraphics, mapModel, 0);
        field.container.addChild(this.mapContainer);
    }
    
    onDestroy(): void {
        this.mapContainer.destroy();
    }

    onUpdate(delta: number, deltaMs: number): void {
        this.pathOffset = (this.pathOffset + pathDotSpeed) % (pathDotLength + pathDotSpacing);
        drawPathDots(this.pathGraphics, this.mapModel, this.pathOffset);    
    }

    updateFromModel(mapModel: MapModel) {
        this.mapModel = mapModel;
    }   
}

// Function to draw the path dots
function drawPathDots(pathGraphics: PIXI.Graphics, mapModel: MapModel, offset: number) {
    pathGraphics.clear();
    
    if (!(mapModel && mapModel.currentPath && mapModel.currentPath.length > 0)) {
        return;
    }    
    for (let i = 0; i < mapModel.currentPath.length - 1; i++) {
        const startX = mapModel.currentPath[i].x * tileSize + tileSize / 2;
        const startY = mapModel.currentPath[i].y * tileSize + tileSize / 2;
        const endX = mapModel.currentPath[i + 1].x * tileSize + tileSize / 2;
        const endY = mapModel.currentPath[i + 1].y * tileSize + tileSize / 2;

        const dx = endX - startX;
        const dy = endY - startY;
        const pathLength = Math.sqrt(dx * dx + dy * dy);
        const numDots = Math.floor(pathLength / (pathDotLength + pathDotSpacing));

        const angle = Math.atan2(dy, dx);

        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        const rectWidth = isHorizontal ? pathDotLength : pathDotLength / 2;
        const rectHeight = isHorizontal ? pathDotLength / 2 : pathDotLength;
        const cornerRadius = Math.min(rectWidth, rectHeight) / 2;

        for (let j = 0; j < numDots; j++) {
            const t = (j * (pathDotLength + pathDotSpacing) + offset) / pathLength;
            const dotX = startX + t * dx;
            const dotY = startY + t * dy;

            const deltaX = Math.cos(angle) * rectWidth / 2;
            const deltaY = Math.sin(angle) * rectHeight / 2;

            pathGraphics.beginFill(0xCCCCFF, 0.5)
                .drawRoundedRect(dotX - deltaX, dotY - deltaY, rectWidth, rectHeight, cornerRadius)
                .endFill();
        }
    }
}