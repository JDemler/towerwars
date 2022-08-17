import Phaser from 'phaser';
import { Game } from '../data/game';
import { connect, getGame, getMobTypes, getTowerTypes, joinGame } from '../api';
import { MobType, TowerType } from '../data/gameConfig';

export default class Demo extends Phaser.Scene {
  // properties
  gameState: Game = {
    fields: [],
    income_cooldown: 0,
    state: "waiting"
  }
  towerTypes: TowerType[] = []
  mobTypes: MobType[] = []
  playerId: number = 0;
  websocket: WebSocket | undefined;
  constructor() {
    super('LobbyScene');
  }

  preload() {
    this.load.image('logo', 'assets/phaser3-logo.png');
    getGame().then(game => {
      //if game is not undefined assign it
      if (game) {
        this.gameState = game;
        console.log("Assigned game");
      }
    }).catch(error => {
      console.log(error);
    })
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
    connect().then(ws => {
      this.websocket = ws;
      this.websocket.onmessage = (event) => {
        console.log(event.data);
        this.handleEvent(JSON.parse(event.data));
      }
    });

    // Join game button
    const joinGameButton = this.add.text(400, 300, 'Join Game', {
      font: '48px Arial',

    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.startGame)
  }

  handleEvent(event: any) {
    switch (event.type) {
      case "playerAdded":
        console.log("Player joined: " + event.payload.player.id);
        break;
      case "gameStateChanged":
        this.gameState = event.payload.gameState;
        break;
    }
  }

  startGame() {
    joinGame().then(playerId => {
      if (playerId) {
        this.playerId = playerId;
        console.log("Assigned to game");
      }
    });
  }

  update(time: number, delta: number): void {
    if (this.gameState && this.gameState.state === 'Playing') {
      this.scene.start('GameScene', { mobTypes: this.mobTypes, towerTypes: this.towerTypes, playerId: this.playerId });
    }
  }
}
