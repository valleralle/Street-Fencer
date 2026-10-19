import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { text } from '../texte.js';

// Liegt über der angehaltenen KampfSzene
export default class PauseSzene extends Phaser.Scene {
  constructor() {
    super('PauseSzene');
  }

  create() {
    // Dreimal so groß wie das Bild, damit es auch breite Handybildschirme ganz abdeckt
    this.add.rectangle(480, 270, 3 * 960, 3 * 540, 0x10141c, 0.88);
    this.add
      .text(480, 170, text('pause.titel'), stil(56))
      .setOrigin(0.5);

    erzeugeMenue(this, 480, 270, [
      { text: text('pause.weiter'), aktion: () => this.weiter() },
      { text: text('zurueckZumTitel'), aktion: () => this.zumTitel() },
    ]);
    this.input.keyboard.on('keydown-ESC', () => this.weiter());
    this.input.keyboard.on('keydown-P', () => this.weiter());
  }

  weiter() {
    this.scene.stop();
    this.scene.resume('KampfSzene');
  }

  zumTitel() {
    this.scene.stop('KampfSzene');
    this.scene.start('TitelSzene');
  }
}
