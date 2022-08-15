import Phaser from 'phaser';
import { Game } from '../data/game';
import { getGame, getMobTypes, getTowerTypes, joinGame, registerEvent } from '../api';
import { drawTWMap } from '../data/twmap';
import { TowerType, MobType } from '../data/gameConfig';
import { drawTower } from '../data/tower';
import { drawMob } from '../data/mob';

export default class Demo extends Phaser.Scene {
  // properties
  gameState: Game;
  towerTypes: TowerType[] = []
  mobTypes: MobType[] = []
  serverAlive: boolean = true;

  constructor() {
    super('GameScene');
    this.gameState = {
      fields: [],
      income_cooldown: 0,
      state: "waiting"
    };
  }

  init(towerTypes: TowerType[], mobTypes: MobType[]): void {
    this.towerTypes = towerTypes;
    this.mobTypes = mobTypes;
  }

  preload() {
    //get mob and tower types
    getMobTypes().then(mobTypes => {
      if (mobTypes) {
        this.mobTypes = mobTypes;
      }
    }).catch(error => {
      console.log(error);
    }
    );
    getTowerTypes().then(towerTypes => {
      if (towerTypes) {
        this.towerTypes = towerTypes;
      }
    }).catch(error => {
      console.log(error);
    });
  }

  create() {
    getGame().then(game => {
      //if game is not undefined assign it
      if (game) {
        this.gameState = game;
        // draw fields    
        this.gameState.fields.forEach((field, i) => {
          if (i == 0) {
            drawTWMap(field.twmap, this.buildTower(field.id), this);
          }
        });
      }
    }).catch(error => {
      console.log(error);
    })
  }

  buildTower(fieldId: number): (x: number, y: number) => void {
    var towerType = this.towerTypes[0];
    return (function (x: number, y: number) {
      console.log("Build tower on field " + fieldId + " at " + x + "," + y);
      registerEvent({
        fieldId: fieldId,
        eventType: "buildTower",
        payload: JSON.stringify({
          x: x,
          y: y,
          towerType: towerType.name
        })
      })
        .then(() => console.log("Tower built"))
        .catch(error => console.log(error));
    })
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
}
