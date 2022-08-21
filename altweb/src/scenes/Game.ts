import Phaser from 'phaser';
import { Game } from '../data/game';
import { connect, getGame, getMobTypes, getTowerTypes, joinGame, registerEvent } from '../api';
import { TowerType, MobType } from '../data/gameConfig';
import { GameField } from '../gameObjects/field';
import { TowerMenu } from '../gameObjects/towerMenu';
import { GameTower } from '../gameObjects/tower';

export default class GameScene extends Phaser.Scene {
  // properties
  gameState: Game;
  serverAlive: boolean = true;
  playerId: number = 0;
  towerTypes: TowerType[] = []
  mobTypes: MobType[] = []
  focussedTowerType: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  websocket: WebSocket | undefined = undefined;
  fields: GameField[] = [];
  fpsLabel: Phaser.GameObjects.Text | undefined = undefined;
  towerMenu: TowerMenu | undefined = undefined;
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
    this.load.plugin('rexoutlinepipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexoutlinepipelineplugin.min.js', true);
    // Load mob images from assets/mobimgs folder
    this.load.path = 'assets/mobimgs/';
    this.load.image('confusedKid', 'confused_kid.jpg');
    this.load.image('facebookAddict', 'facebook_addict.jpg');
    this.load.image('facebookMom', 'facebook_mom.jpg');
    this.load.image('facebookTroll', 'facebook_troll.jpg');
    this.load.image('karen', 'karen.jpg');
    this.load.image('niceGuy', 'nice_guy.jpg');
    // Load mob sprites from assets/mobSprites folder
    this.load.path = 'assets/mobSprites/';
    this.load.spritesheet('blueball', 'blueball.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    this.fpsLabel = this.add.text(600, 700, "FPS: " + this.game.loop.actualFps);
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
    this.offsetX = fieldId * 500 + 160;
    this.offsetY = 0;
  }

  setTowerMenu(tower: GameTower) {
    tower.focus = true;
    this.setOffsetForField(this.playerId);
    if (this.towerMenu) {
      this.towerMenu.setToTowerType(tower.tower, this.getTowerType(tower.tower.type));
    } else {
      this.towerMenu = new TowerMenu(this, tower.tower, this.getTowerType(tower.tower.type));
    }
  }

  getTowerType(towerType: string): TowerType {
    return this.towerTypes.find(t => t.name === towerType)!;
  }

  handleEvent(event: any): void {
    this.setOffsetForField(event.payload.fieldId);
    if (event.payload.fieldId !== undefined) {
      var field = this.fields.find(f => f.id == event.payload.fieldId);
      if (field) {
        field.handleEvent(event);
      } else {
        console.error("Field not found for event!");
        console.error(event)
      }
    } else {
      switch (event.type) {
        case "gameStateChanged":
          this.gameState.state = event.payload.gameState;
          break;
      }
    }
  }


  update(time: number, delta: number): void {
    this.fpsLabel?.setText("FPS: " + this.game.loop.actualFps);
    if (!this.serverAlive) {
      return;
    }
  }

}
