import Phaser from 'phaser';
import { Game } from '../data/game';
import { getGame, joinGame } from '../api';

export default class Demo extends Phaser.Scene {
  // properties
  gameState: Game;

  constructor() {
    super('LobbyScene');
    this.gameState = null;
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
  }

  create() {
    // Join game button
    const joinGameButton = this.add.text(400, 300, 'Join Game', {
      font: '48px Arial',

    })
    .setInteractive( { useHandCursor: true } )
    .on('pointerdown', this.startGame)
  }

  startGame() {
    joinGame()
  }

  update(time: number, delta: number): void {      
    if (this.gameState  && this.gameState.state === 'Playing') {      
      this.scene.start('GameScene');
    }
  }
}
