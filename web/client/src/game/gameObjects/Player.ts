import * as PIXI from "pixi.js";
import { GameObject, Field, IGameObjectProps } from "@gameObjects";
import { MapModel, PlayerModel } from "@models";
import { GridSettings, GridCoordinate } from "@grid";
import { handleViewportClick } from "@helpers";

export default class Player extends GameObject {
  playerModel: PlayerModel;
  mapModel: MapModel;

  healthBarBorder: PIXI.Graphics;
  healthBarFill: PIXI.Graphics;
  healthBarX: number;
  healthBarY: number;

  constructor(
    props: IGameObjectProps,
    field: Field,
    mapModel: MapModel,
    playerModel: PlayerModel,
    isCurrentPlayer: boolean
  ) {
    super(props);

    this.playerModel = playerModel;
    this.mapModel = mapModel;

    const tileSize = GridSettings.tileSize;

    // Draw the health bar below the tiles
    const healthBarWidth = this.mapModel.size.width * tileSize;
    const healthBarHeight = 10; // You can change this value to set the height of the health bar
    this.healthBarX = 0;
    this.healthBarY = this.mapModel.size.height * tileSize + tileSize * 0.5;

    // Draw the health bar background with a white border
    this.healthBarBorder = new PIXI.Graphics()
      .lineStyle(2, 0xffffff)
      .beginFill(0x000000, 0)
      .drawRect(
        this.healthBarX - 1,
        this.healthBarY - 1,
        healthBarWidth + 2,
        healthBarHeight + 2
      )
      .endFill();

    const greenFillWidth =
      Math.min(this.playerModel.lives / 30, 1) * healthBarWidth;
    this.healthBarFill = new PIXI.Graphics()
      .beginFill(0x00ff99)
      .drawRect(
        this.healthBarX,
        this.healthBarY,
        greenFillWidth,
        healthBarHeight
      )
      .endFill();

    field.container.addChild(this.healthBarBorder);
    field.container.addChild(this.healthBarFill);
  }

  onUpdate() {
    const healthBarWidth = this.mapModel.size.width * GridSettings.tileSize;
    const greenFillWidth = Math.min(this.playerModel.lives / 30, 1) * healthBarWidth;

    this.healthBarFill
      .clear()
      .beginFill(0x00ff99)
      .drawRect(this.healthBarX, this.healthBarY, greenFillWidth, 10)
      .endFill();
  }

  updateFromModel(playerModel: PlayerModel) {
    this.playerModel = playerModel;
  }   

  onDestroy(): void {
    this.healthBarBorder.destroy();
    this.healthBarFill.destroy();
  }
}
