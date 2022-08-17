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

  //descructor
  destroy() {
    if (this.websocket) {
      console.log("Closing Lobby websocket");
      this.websocket.close();
    }
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
    console.log(event)
    switch (event.type) {
      case "playerJoined":
        console.log("Player joined: " + event.payload.player.id);
        break;
      case "gameStateChanged":
        console.log("Game state changed to: " + event.payload.gameState);
        this.gameState.state = event.payload.gameState;
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
    //console.log(this.gameState);
    if (this.gameState && this.gameState.state === 'Playing') {
      this.scene.start('GameScene', { mobTypes: this.mobTypes, towerTypes: this.towerTypes, playerId: this.playerId });
      this.destroy();
    }
  }
}
