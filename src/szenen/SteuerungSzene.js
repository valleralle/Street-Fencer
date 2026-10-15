import Phaser from 'phaser';
import { stil } from '../schrift.js';

const ZEILEN = [
  ['', 'Rot (links)', 'Grün (rechts)'],
  ['Bewegen', 'A / D', 'Pfeil links / rechts'],
  ['Stoß', 'F', 'K'],
  ['Parade', 'G', 'L'],
  ['Tiefstoß', 'S', '↓'],
];

export default class SteuerungSzene extends Phaser.Scene {
  constructor() {
    super('SteuerungSzene');
  }

  init(daten) {
    this.danach = daten.danach ?? 'TitelSzene';
    this.daten = daten;
  }

  create() {
    this.registry.set('steuerungGezeigt', true);
    const schrift = stil(24);

    this.add.text(480, 50, 'Steuerung', { ...schrift, fontSize: '40px' }).setOrigin(0.5);

    const spalten = [250, 480, 720];
    const farben = ['#9aa3b5', '#e03b3b', '#2fbf4f'];
    ZEILEN.forEach((zeile, z) => {
      zeile.forEach((zelle, s) => {
        const farbe = z === 0 || s === 0 ? farben[z === 0 ? s : 0] : '#ffffff';
        this.add.text(spalten[s], 120 + z * 40, zelle, { ...schrift, color: farbe }).setOrigin(0.5);
      });
    });

    this.add
      .text(
        480,
        345,
        'Ausfall = vorwärts + Stoß\n' +
          'Riposte = Stoß direkt nach einer gelungenen Parade\n' +
          'Wer zuerst 5 Treffer hat, gewinnt · Esc = Pause',
        { ...schrift, fontSize: '19px', align: 'center', color: '#c8ccd4', lineSpacing: 8 },
      )
      .setOrigin(0.5, 0);

    const weiter = this.danach === 'KampfSzene' ? 'Enter: Los geht’s!' : 'Enter: zurück';
    this.add.text(480, 480, weiter, { ...schrift, color: '#ffd166' }).setOrigin(0.5);

    const los = () => this.scene.start(this.danach, this.daten);
    this.input.keyboard.on('keydown-ENTER', los);
    this.input.keyboard.on('keydown-SPACE', los);
    this.input.keyboard.on('keydown-ESC', los);
  }
}
