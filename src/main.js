import Phaser from 'phaser';
import TitelSzene from './szenen/TitelSzene.js';
import SteuerungSzene from './szenen/SteuerungSzene.js';
import KampfSzene from './szenen/KampfSzene.js';
import PauseSzene from './szenen/PauseSzene.js';
import SiegerSzene from './szenen/SiegerSzene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'spiel',
  width: 960,
  height: 540,
  backgroundColor: '#1d2330',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [TitelSzene, SteuerungSzene, KampfSzene, PauseSzene, SiegerSzene],
};

new Phaser.Game(config);
