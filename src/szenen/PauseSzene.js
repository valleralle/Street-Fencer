import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';

// Liegt über der angehaltenen KampfSzene
export default class PauseSzene extends Phaser.Scene {
  constructor() {
    super('PauseSzene');
  }

  create() {
    this.add.rectangle(480, 270, 960, 540, 0x10141c, 0.88);
    this.add
      .text(480, 170, 'Pause', { fontFamily: 'sans-serif', fontSize: '48px', color: '#ffffff' })
      .setOrigin(0.5);

    erzeugeMenue(this, 480, 270, [
      { text: 'Weiter', aktion: () => this.weiter() },
      { text: 'Zurück zum Titel', aktion: () => this.zumTitel() },
    ]);
    this.input.keyboard.on('keydown-ESC', () => this.weiter());
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
