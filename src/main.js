import Phaser from 'phaser';
import TitelSzene from './szenen/TitelSzene.js';
import SteuerungSzene from './szenen/SteuerungSzene.js';
import StufenSzene from './szenen/StufenSzene.js';
import EinstellungenSzene from './szenen/EinstellungenSzene.js';
import TastenSzene from './szenen/TastenSzene.js';
import KampfSzene from './szenen/KampfSzene.js';
import PauseSzene from './szenen/PauseSzene.js';
import SiegerSzene from './szenen/SiegerSzene.js';
import { ladeSchrift } from './schrift.js';

const config = {
  type: Phaser.AUTO,
  parent: 'spiel',
  width: 960,
  height: 540,
  backgroundColor: '#1d2330',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [TitelSzene, StufenSzene, SteuerungSzene, EinstellungenSzene, TastenSzene, KampfSzene, PauseSzene, SiegerSzene],
};

ladeSchrift().then(() => new Phaser.Game(config));
