import Phaser from 'phaser';

export const TileSize: number = (window.innerHeight * 0.7) / 18;
export const FieldWidth: number = TileSize * 10;
export const FieldHeight: number = TileSize * 18;

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#000000',
  fps: { target: window._env_.VITE_FPS, forceSetTimeOut: true },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    parent: 'game',
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
