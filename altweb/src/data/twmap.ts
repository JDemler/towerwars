import { Tilemaps } from "phaser";
import { FieldHeight, FieldWidth, TileSize } from "../config";
import GameScene from "../scenes/Game";

export type TWMap = {
    xstart: number;
    ystart: number;
    xend: number;
    yend: number;
    tiles: Tile[][];
}

export function drawTWMap(map: TWMap, onClick: (x: number, y: number) => void, scene: GameScene, isPlayer: boolean): Phaser.GameObjects.Rectangle[] {
    var tiles: Phaser.GameObjects.Rectangle[] = [];
    // Draw a border around the map if it is the player's map
    if (isPlayer) {
        scene.add.rectangle(scene.offsetX + FieldWidth / 2, scene.offsetY + FieldHeight / 2, FieldWidth + 10, FieldHeight + 10, 0xFFFFFF);
        //debug log positions of that border
        console.log("offsetX: " + (scene.offsetX - 5) + " offsetY: " + (scene.offsetY - 5));
    }
    map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
            tiles.push(drawTile(tile, onClick, scene, isPlayer))
        })
    });
}

export type Tile = {
    x: number;
    y: number;
}

function drawTile(tile: Tile, onClick: (x: number, y: number) => void, scene: GameScene, isPlayer): Phaser.GameObjects.Rectangle {
    var color = 0x111111;
    // chessboard pattern by tile.x and tile.y
    if ((tile.x + tile.y) % 2 === 0) {
        color = 0x333333;
    }

    var rect = scene.add.rectangle(tile.x * TileSize + TileSize / 2 + scene.offsetX, tile.y * TileSize + TileSize / 2 + scene.offsetY, TileSize, TileSize, color);
    if (isPlayer) {
        rect.setInteractive()
            .on('pointerover', () => {
                rect.setFillStyle(0x444444);
            })
            .on('pointerout', () => {
                rect.setFillStyle(color);
            })
            .on('pointerdown', () => { onClick(tile.x, tile.y) });
    }
}
