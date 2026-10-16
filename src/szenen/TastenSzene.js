import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { FECHTERFARBEN } from '../farben.js';
import {
  einstellungen,
  AKTIONEN,
  AKTIONS_NAMEN,
  belegeTaste,
  speichereEinstellungen,
  tastenName,
} from '../einstellungen.js';

const NAMEN = { rot: 'Rot', gruen: 'Grün' };

// Tastenbelegung eines Spielers: Aktion wählen, Enter, dann die neue Taste drücken
export default class TastenSzene extends Phaser.Scene {
  constructor() {
    super('TastenSzene');
  }

  init(daten) {
    this.farbe = daten.farbe ?? 'rot';
    this.wartetAuf = null; // Aktion, für die gerade eine Taste erwartet wird
  }

  create() {
    this.add.text(480, 60, `Tasten ${NAMEN[this.farbe]}`, stil(48, FECHTERFARBEN[this.farbe])).setOrigin(0.5);

    const tasten = einstellungen.tasten[this.farbe];
    this.menue = erzeugeMenue(
      this,
      480,
      140,
      [
        ...AKTIONEN.map((aktion) => ({
          text: () => `${AKTIONS_NAMEN[aktion]}: ${this.wartetAuf === aktion ? '…' : tastenName(tasten[aktion])}`,
          aktion: () => this.warteAufTaste(aktion),
        })),
        { text: 'Zurück', aktion: () => this.scene.start('EinstellungenSzene') },
      ],
      { abstand: 40, groesse: 26, gesperrt: () => this.wartetAuf !== null },
    );

    this.hinweis = this.add.text(480, 450, '', stil(20, '#ffd166')).setOrigin(0.5);
    this.add
      .text(480, 500, 'Enter: neue Taste festlegen · Esc zurück · Esc, P, Enter und Leertaste sind reserviert', stil(16, '#5d6578'))
      .setOrigin(0.5);

    this.input.keyboard.on('keydown', (ereignis) => this.tasteGedrueckt(ereignis));
  }

  warteAufTaste(aktion) {
    this.wartetAuf = aktion;
    // Phaser meldet denselben Enter-Druck gleich danach noch einmal als allgemeinen Tastendruck
    this.ueberspringeEinmal = true;
    this.hinweis.setText(`Drücke die neue Taste für ${AKTIONS_NAMEN[aktion]} …`);
  }

  tasteGedrueckt(ereignis) {
    const name = Object.keys(Phaser.Input.Keyboard.KeyCodes).find(
      (k) => Phaser.Input.Keyboard.KeyCodes[k] === ereignis.keyCode,
    );
    if (this.ueberspringeEinmal) {
      this.ueberspringeEinmal = false;
      return;
    }
    if (this.wartetAuf === null) {
      if (name === 'ESC') this.scene.start('EinstellungenSzene');
      return;
    }

    if (name === 'ESC') {
      this.hinweis.setText('Abgebrochen');
    } else if (!name || !belegeTaste(einstellungen, this.farbe, this.wartetAuf, name)) {
      this.hinweis.setText('Diese Taste geht nicht – bitte eine andere');
      return;
    } else {
      speichereEinstellungen(einstellungen);
      this.hinweis.setText(`${AKTIONS_NAMEN[this.wartetAuf]}: ${tastenName(name)}`);
    }
    this.wartetAuf = null;
    this.menue.aktualisiere();
  }
}
