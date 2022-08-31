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
  playerKey: string = "";
  gameId: string = "";
  username: string;
  websocket: WebSocket | undefined;
  constructor() {
    super('LobbyScene');
    this.username = "hans23";
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
  }

  create() {
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
      case "player":
        if (event.kind == "created") {
          console.log("Player joined: " + event.payload.player.id);
        }
        break;
      case "gameStateChanged":
        console.log("Game state changed to: " + event.payload.gameState);
        this.gameState.state = event.payload.gameState;
        break;
    }
  }

  startGame() {
    this.scene.username = "hans23";
    joinGame(this.scene.username).then(addedPlayer => {
      if (addedPlayer) {
        this.scene.setPlayerId(addedPlayer.fieldId);
        this.scene.setPlayerKey(addedPlayer.key);
        this.scene.gameId = addedPlayer.gameId;

        connect(addedPlayer.gameId, addedPlayer.key).then(ws => {

          this.scene.websocket = ws;
          this.scene.websocket.onmessage = (event) => {
            if (this.scene == undefined) {
              ws.close();
              return
            }
            console.log(event.data);
            this.scene.handleEvent(JSON.parse(event.data));
          }
        });

        console.log(addedPlayer)
        console.log("Assigned to game");
      }
    });
  }

  setPlayerId(id: number) {
    this.playerId = id;
  }
  setPlayerKey(key: string) {
    this.playerKey = key;
  }

  update(time: number, delta: number): void {
    //console.log(this.gameState);
    if (this.gameState && this.gameState.state === 'Playing') {
      this.scene.start('GameScene', { gameId: this.gameId, mobTypes: this.mobTypes, towerTypes: this.towerTypes, playerId: this.playerId, playerKey: this.playerKey, username: this.username });
      this.destroy();
    }
  }
}
