import Phaser from 'phaser';
import { Game } from '../data/game';
import { connect, getGame, getMobTypes, getTowerTypes, joinGame, registerEvent } from '../api';
import { drawTWMap } from '../data/twmap';
import { TowerType, MobType } from '../data/gameConfig';
import { drawTower } from '../data/tower';
import { drawMob } from '../data/mob';

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
      }
    });

    getGame().then(game => {
      //if game is not undefined assign it
      if (game) {
        this.gameState = game;
        // draw fields    
        this.gameState.fields.forEach((field, i) => {
          this.offsetX = field.id * 400;
          drawTWMap(field.twmap, this.buildTower(field.id), this);
          this.drawBuyMobButtons(field.id);
        });
      }
    }).catch(error => {
      console.log(error);
    })
  }

  buildTower(fieldId: number): (x: number, y: number) => void {
    var towerType = this.towerTypes[0];
    var ws = this.websocket;
    return (x: number, y: number) => {
      console.log("Build tower on field " + fieldId + " at " + x + "," + y);
      if (ws) {
        ws.send(JSON.stringify({
          fieldId: fieldId,
          eventType: "buildTower",
          payload: JSON.stringify({
            towerType: towerType.name,
            x: x,
            y: y
          })
        }));
      }
    }
  }


  update(time: number, delta: number): void {
    if (!this.serverAlive) {
      return;
    }
    getGame().then(game => {
      if (game) {
        this.gameState = game;
        // draw new mobs
        this.gameState.fields.forEach(field => {
          this.offsetX = field.id * 400;
          field.mobs.forEach(mob => {
            drawMob(mob, this);
          });
          field.towers.forEach(tower => {
            drawTower(tower, this);
          });
        });
      };
    }).catch(error => {
      this.serverAlive = false;
      console.log(error);
    });
  }

  drawBuyMobButtons(fieldId: number): void {
    this.mobTypes.forEach((mobType, i) => {
      this.add.text(100 + this.offsetX + (i * 100), 500, mobType.name, {
        font: '48px Arial',
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          registerEvent({
            fieldId: fieldId,
            eventType: "buyMob",
            payload: JSON.stringify({
              mobType: mobType.name,
              targetFieldId: 1 - fieldId
            })
          })
            .then(() => console.log("Mob bought"))
            .catch(error => console.log(error));
        }
        );
    }
    );
  }
}
