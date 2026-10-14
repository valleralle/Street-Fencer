import Phaser from 'phaser';
import KampfSzene from './szenen/KampfSzene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'spiel',
  width: 960,
  height: 540,
  backgroundColor: '#1d2330',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [KampfSzene],
};

new Phaser.Game(config);
