import Phaser from 'phaser';

export const TileSize: number = 32;

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#000000',
  fps: { target: import.meta.env.VITE_FPS, forceSetTimeOut: true },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    width: 1020,
    height: 720,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
