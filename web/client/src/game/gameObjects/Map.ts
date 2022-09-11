import * as PIXI from 'pixi.js';
import { GameObject, Field, IGameObjectProps } from "@gameObjects";
import { MapModel } from '@models';
import { GridSettings, GridCoordinate } from '@grid';
import { handleViewportClick } from '@helpers';

export default class Map extends GameObject {
    mapModel: MapModel;

    tileGraphics: PIXI.Graphics[] = [];

    constructor(props: IGameObjectProps, field: Field, mapModel: MapModel) {
        super(props);

        this.mapModel = mapModel;

        const tileSize = GridSettings.tileSize;
        
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

                field.container.addChild(tile);
        
                this.tileGraphics.push(tile);
            }
        }
    }

    onUpdate(delta: number, deltaMs: number): void {

    }
    
    onDestroy(): void {
        for (const tile of this.tileGraphics) {
            tile.destroy();
        }
    }
}