import * as PIXI from 'pixi.js';
import { GameObject, Field, IGameObjectProps } from "@gameObjects";
import { MapModel } from '@models';
import { GridSettings, GridCoordinate } from '@grid';
import { handleViewportClick } from '@helpers';

export default class Map extends GameObject {
    mapModel: MapModel;

    tileGraphics: PIXI.Graphics[] = [];

    mapContainer: PIXI.Container;

    constructor(props: IGameObjectProps, field: Field, mapModel: MapModel, isCurrentPlayer: boolean) {
        super(props);

        this.mapModel = mapModel;

        this.mapContainer = new PIXI.Container();

        const tileSize = GridSettings.tileSize;

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

        field.container.addChild(this.mapContainer);
    }
    
    onDestroy(): void {
        this.mapContainer.destroy();
    }
}