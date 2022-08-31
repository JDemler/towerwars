import { GameObject } from "./GameObject";
import { MapModel } from '../../models';
import { GridSettings } from '../../lib/GridSettings';
import Field from './Field';
import * as PIXI from 'pixi.js';

export default class Map extends GameObject {
    mapModel: MapModel;

    tileGraphics: PIXI.Graphics[] = [];

    constructor(app: PIXI.Application, field: Field, mapModel: MapModel) {
        super(app);

        this.mapModel = mapModel;

        const tileSize = GridSettings.tileSize;

        const grid = new PIXI.Graphics()
        
        grid.alpha = 0.5;
        grid.zIndex = 0;

        for (let i = 0; i < mapModel.size.width; i++) {
            for (let j = 0; j < mapModel.size.height; j++) {
                // Determine the color based on the x and y position in a checkerboard pattern
                const color = (i + j) % 2 === 0 ? 0x5BBA6F : 0x42754d;

                grid
                    .beginFill(color)
                    .drawRect(i * tileSize, j * tileSize, tileSize, tileSize)
                    .endFill()
            }
        }

        field.container.addChild(grid);

        this.tileGraphics.push(grid);
    }

    onUpdate(delta: number, deltaMs: number): void {

    }
    
    onDestroy(): void {
        for (const tile of this.tileGraphics) {
            tile.destroy();
        }
    }
}