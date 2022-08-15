import Phaser from 'phaser';
import config from './config';
import LobbyScene from './scenes/Lobby';
import GameScene from './scenes/Game';

new Phaser.Game(
  Object.assign(config, {
    scene: [LobbyScene, GameScene]
  })
);
