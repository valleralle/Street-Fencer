import Phaser from 'phaser';
import TitelSzene from './szenen/TitelSzene.js';
import SteuerungSzene from './szenen/SteuerungSzene.js';
import StufenSzene from './szenen/StufenSzene.js';
import EinstellungenSzene from './szenen/EinstellungenSzene.js';
import TastenSzene from './szenen/TastenSzene.js';
import TrainingSzene from './szenen/TrainingSzene.js';
import KampfSzene from './szenen/KampfSzene.js';
import PauseSzene from './szenen/PauseSzene.js';
import SiegerSzene from './szenen/SiegerSzene.js';
import { ladeSchrift } from './schrift.js';
import { zentriereAlleSzenen } from './bildschirm.js';
import { stummImHintergrund } from './hintergrund.js';
import { wendeSpracheAufSeiteAn } from './texte.js';

wendeSpracheAufSeiteAn();

// Auf dem Handy füllt das Spiel den ganzen Bildschirm, am Computer bleibt es bei 16:9 (siehe bildschirm.js)
const handy = matchMedia('(pointer: coarse)').matches;

const config = {
  type: Phaser.AUTO,
  parent: 'spiel',
  width: 960,
  height: 540,
  backgroundColor: '#1d2330',
  pixelArt: true,
  scale: {
    mode: handy ? Phaser.Scale.EXPAND : Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [TitelSzene, StufenSzene, SteuerungSzene, EinstellungenSzene, TastenSzene, TrainingSzene, KampfSzene, PauseSzene, SiegerSzene],
};

ladeSchrift().then(() => {
  const spiel = new Phaser.Game(config);
  zentriereAlleSzenen(spiel);
  spiel.events.once('ready', () => {
    if (spiel.sound.context) stummImHintergrund(spiel.sound.context);
  });
});

// Auf dem Handy beim ersten Antippen in den Vollbildmodus (quer) wechseln, falls der Browser das erlaubt
if (handy && document.fullscreenEnabled) {
  document.addEventListener(
    'pointerup',
    () => {
      document.documentElement
        .requestFullscreen()
        .then(() => screen.orientation?.lock?.('landscape'))
        .catch(() => {});
    },
    { once: true },
  );
}
