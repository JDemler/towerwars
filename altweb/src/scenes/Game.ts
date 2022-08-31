import Phaser from 'phaser';
import { Game } from '../data/game';
import { connect, getGame, getMobTypes, getTowerTypes, joinGame, registerEvent } from '../api';
import { TowerType, MobType } from '../data/gameConfig';
import { GameField } from '../gameObjects/field';
import { TowerMenu } from '../gameObjects/towerMenu';
import { GameTower } from '../gameObjects/tower';
import { FieldHeight, FieldWidth, TileSize } from '../config';
import { TowerDescription } from '../gameObjects/towerDescription';

export default class GameScene extends Phaser.Scene {
  // properties
  gameState: Game;
  gameId: string = "";
  serverAlive: boolean = true;
  playerId: number = 0;
  playerKey: string = "";
  towerTypes: TowerType[] = []
  mobTypes: MobType[] = []
  focussedTowerType: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  websocket: WebSocket | undefined = undefined;
  fields: GameField[] = [];
  fpsLabel: Phaser.GameObjects.Text | undefined = undefined;
  debugLabel: Phaser.GameObjects.Text | undefined = undefined;
  towerMenu: TowerMenu | undefined = undefined;
  towerDescription: TowerDescription | undefined = undefined;
  constructor() {
    super('GameScene');
    this.gameState = {
      fields: [],
      income_cooldown: 0,
      state: "waiting"
    };

  }

  init(data: { gameId: string, towerTypes: TowerType[], mobTypes: MobType[], playerId: number, playerKey: string }): void {
    this.towerTypes = data.towerTypes;
    this.mobTypes = data.mobTypes;
    this.playerId = data.playerId;
    this.gameId = data.gameId;
    this.playerKey = data.playerKey;
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
    // Load tower images from assets/towerimgs folder
    this.load.path = 'assets/towerimgs/';
    this.load.image('comment', 'comment.jpg');
    this.load.image('likeButton', 'like_button.jpg');
    this.load.image('profilePicture', 'profile_picture.jpg');
  }

  create() {
    this.fpsLabel = this.add.text(window.innerWidth - 75, window.innerHeight - 20, "FPS: " + Math.round(this.game.loop.actualFps));
    this.debugLabel = this.add.text(600, 800, "Width + Height: " + window.innerWidth + " + " + window.innerHeight + ' + ' + TileSize + ' + ' + this.fields.length);
    console.log("connecting to websocket with game id: " + this.gameId);
    connect(this.gameId, this.playerKey).then(ws => {
      this.websocket = ws;
      this.websocket.onmessage = (event) => {
        console.log(event);
        //console.log(event.data);
        this.handleEvent(JSON.parse(event.data));
      }
    });
    //get mob and tower types
    getMobTypes(this.gameId).then(mobTypes => {
      if (mobTypes) {
        this.mobTypes = mobTypes;
      }
    }).catch(error => {
      console.log(error);
    }
    );
    getTowerTypes(this.gameId).then(towerTypes => {
      if (towerTypes) {
        this.towerTypes = towerTypes;
      }
    }).catch(error => {
      console.log(error);
    });

    getGame(this.gameId).then(game => {
      //if game is not undefined assign it
      if (game && this.mobTypes && this.towerTypes) {
        this.gameState = game;
        // draw fields    
        this.gameState.fields.forEach((field, i) => {
          var gameField = new GameField(this, field);
          this.fields.push(gameField);
        });
        this.towerMenu = new TowerMenu(this);
      }
    }).catch(error => {
      console.log(error);
    })

  }

  setOffsetForField(fieldId: number): void {
    //offset for field is dependent on the playerID. The field for the player should be centered
    this.offsetY = FieldHeight / 8;
    if (this.fields.length > 2) {
      if (fieldId === this.playerId) {
        this.offsetX = (window.innerWidth / 2) - (FieldWidth / 2);
      } else {
        let offset = fieldId - this.playerId;
        this.offsetX = (window.innerWidth / 2) - FieldWidth / 2 + offset * (FieldWidth + FieldWidth / 3);
      }
    } else {
      this.offsetX = (fieldId * window.innerWidth / 2) + (window.innerWidth / 4) - (FieldWidth / 2);

    }
  }

  setTowerDescription(tower: GameTower) {
    tower.focus = true;
    this.setOffsetForField(this.playerId);
    if (this.towerDescription) {
      this.towerDescription.setTowerDescription(this.getTowerType(tower.tower.type), tower.tower);
    } else {
      this.towerDescription = new TowerDescription(this, tower.tower, this.getTowerType(tower.tower.type));
    }
  }

  getSelectedTowerKey(): string {
    return this.towerTypes[this.focussedTowerType].key;
  }

  setSelectedTower(index: number) {
    this.focussedTowerType = index;
    if (this.towerMenu) {
      this.towerMenu.setSelectedTower(index);
    }
  }

  getTowerType(towerType: string): TowerType {
    return this.towerTypes.find(t => t.key === towerType)!;
  }

  handleEvent(event: any): void {
    this.setOffsetForField(event.fieldId);
    if (event.fieldId !== undefined) {
      var field = this.fields.find(f => f.id == event.fieldId);
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
    this.fpsLabel?.setText("FPS: " + Math.round(this.game.loop.actualFps));
    this.debugLabel?.setText("Width + Height: " + window.innerWidth + " + " + window.innerHeight + ' + ' + TileSize + ' + ' + this.fields.length);
    if (!this.serverAlive) {
      return;
    }
  }

}
