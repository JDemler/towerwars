import { Tilemaps } from "phaser";
import GameScene from "../scenes/Game";

const TileSize = 32;

export type TWMap = {
    xstart: number;
    ystart: number;
    xend: number;
    yend: number;
    tiles: Tile[][];
}

export function drawTWMap(map: TWMap, onClick: (x: number, y: number) => void, scene: GameScene) {
    map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
            drawTile(tile, onClick, scene)
        })
    });
}

export type Tile = {
    x: number;
    y: number;
}

function drawTile(tile: Tile, onClick: (x: number, y: number) => void, scene: GameScene) {
    var color = 0xEEEEEE;
    // chessboard pattern by tile.x and tile.y
    if ((tile.x + tile.y) % 2 === 0) {
        color = 0xDDDDDD;
    }

    scene.add.rectangle(tile.x * TileSize + TileSize / 2 + scene.offsetX, tile.y * TileSize + TileSize / 2 + scene.offsetY, TileSize, TileSize, color)
        .setInteractive()
        .on('pointerdown', () => { onClick(tile.x, tile.y) });
}
