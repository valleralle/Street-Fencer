import Phaser from 'phaser';
import { stil } from '../schrift.js';
import { FECHTERFARBEN } from '../farben.js';
import { einstellungen, tastenName, AKTIONS_NAMEN } from '../einstellungen.js';

// Tabelle der aktuellen Tastenbelegung (siehe Einstellungen)
function zeilen() {
  const { rot, gruen } = einstellungen.tasten;
  const bewegen = (t) => `${tastenName(t.links)} / ${tastenName(t.rechts)}`.replace('Pfeil links / Pfeil rechts', 'Pfeil links / rechts');
  return [
    ['', 'Rot (links)', 'Grün (rechts)'],
    ['Bewegen', bewegen(rot), bewegen(gruen)],
    ...['stoss', 'parade', 'tiefstoss', 'fleche'].map((a) => [AKTIONS_NAMEN[a], tastenName(rot[a]), tastenName(gruen[a])]),
  ];
}

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

    this.add.text(480, 44, 'Steuerung', { ...schrift, fontSize: '40px' }).setOrigin(0.5);

    const spalten = [250, 480, 720];
    const farben = ['#9aa3b5', FECHTERFARBEN.rot, FECHTERFARBEN.gruen];
    zeilen().forEach((zeile, z) => {
      zeile.forEach((zelle, s) => {
        const farbe = z === 0 || s === 0 ? farben[z === 0 ? s : 0] : '#ffffff';
        this.add.text(spalten[s], 105 + z * 38, zelle, { ...schrift, color: farbe }).setOrigin(0.5);
      });
    });

    this.add
      .text(
        480,
        350,
        'Ausfall = vorwärts + Stoß · Finte = beim Ausholen noch einmal Stoß\n' +
          'Riposte = Stoß direkt nach einer gelungenen Parade\n' +
          'Wer zuerst 5 Treffer hat, gewinnt · Esc oder P = Pause · Tasten ändern unter Einstellungen',
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
