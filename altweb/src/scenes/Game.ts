import Phaser from 'phaser';
import { Game } from '../data/game';
import { connect, getGame, getMobTypes, getTowerTypes, joinGame, registerEvent } from '../api';
import { TowerType, MobType } from '../data/gameConfig';
import { GameField } from '../gameObjects/field';

export default class GameScene extends Phaser.Scene {
  // properties
  gameState: Game;
  serverAlive: boolean = true;
  playerId: number = 0;
  towerTypes: TowerType[] = []
  mobTypes: MobType[] = []
  offsetX: number = 0;
  offsetY: number = 0;
  websocket: WebSocket | undefined = undefined;
  fields: GameField[] = [];

  constructor() {
    super('GameScene');
    this.gameState = {
      fields: [],
      income_cooldown: 0,
      state: "waiting"
    };
  }

  init(data: { towerTypes: TowerType[], mobTypes: MobType[], playerId: number }): void {
    this.towerTypes = data.towerTypes;
    this.mobTypes = data.mobTypes;
    this.playerId = data.playerId;
    // log player id
    console.log("Player id: " + this.playerId);
  }

  preload() {

  }

  create() {
    connect().then(ws => {
      this.websocket = ws;
      this.websocket.onmessage = (event) => {
        console.log(event.data);
        this.handleEvent(JSON.parse(event.data));
      }
    });

    getGame().then(game => {
      //if game is not undefined assign it
      if (game) {
        this.gameState = game;
        // draw fields    
        this.gameState.fields.forEach((field, i) => {
          var gameField = new GameField(this, field);
          this.fields.push(gameField);
        });
      }
    }).catch(error => {
      console.log(error);
    })
  }

  setOffsetForField(fieldId: number): void {
    this.offsetX = fieldId * 400;
    this.offsetY = 0;
  }

  handleEvent(event: any): void {
    this.setOffsetForField(event.payload.fieldId);
    var field = this.fields.find(f => f.id == event.payload.fieldId);
    if (field) {
      field.handleEvent(event);
    } else {
      console.error("Field not found for event!");
      console.error(event)
    }
  }


  update(time: number, delta: number): void {
    if (!this.serverAlive) {
      return;
    }
  }

  drawBuyMobButtons(fieldId: number): void {

  }
}
