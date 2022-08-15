import Phaser from 'phaser';
import { Game } from '../data/game';
import { getGame, joinGame } from '../api';

export default class Demo extends Phaser.Scene {
  // properties
  gameState: Game;

  constructor() {
    super('GameScene');
    this.gameState = null;
  }

  preload() {
    this.load.image('logo', 'assets/phaser3-logo.png');
    this.gameState = getGame();

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
}
