import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { starteGefecht } from './TitelSzene.js';

// Auswahl der Schwierigkeitsstufe für den Computergegner
export default class StufenSzene extends Phaser.Scene {
  constructor() {
    super('StufenSzene');
  }

  create() {
    this.add.text(480, 120, 'Gegen Computer', stil(56)).setOrigin(0.5);
    this.add.text(480, 180, 'Du spielst Rot (links)', stil(24, '#9aa3b5')).setOrigin(0.5);

    const gefecht = (stufe) => () => starteGefecht(this, { modus: 'computer', stufe });
    erzeugeMenue(this, 480, 260, [
      { text: 'Leicht', aktion: gefecht('leicht') },
      { text: 'Mittel', aktion: gefecht('mittel') },
      { text: 'Schwer', aktion: gefecht('schwer') },
      { text: 'Zurück', aktion: () => this.scene.start('TitelSzene') },
    ]);
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('TitelSzene'));
  }
}
