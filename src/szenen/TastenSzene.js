import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { FECHTERFARBEN } from '../farben.js';
import {
  einstellungen,
  AKTIONEN,
  aktionsName,
  belegeTaste,
  speichereEinstellungen,
  tastenName,
} from '../einstellungen.js';
import { text, farbname } from '../texte.js';

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
    this.add.text(480, 60, text('einstellungen.tasten', { farbe: farbname(this.farbe) }), stil(48, FECHTERFARBEN[this.farbe])).setOrigin(0.5);

    const tasten = einstellungen.tasten[this.farbe];
    this.menue = erzeugeMenue(
      this,
      480,
      140,
      [
        ...AKTIONEN.map((aktion) => ({
          text: () => `${aktionsName(aktion)}: ${this.wartetAuf === aktion ? '…' : tastenName(tasten[aktion])}`,
          aktion: () => this.warteAufTaste(aktion),
        })),
        { text: text('zurueck'), aktion: () => this.scene.start('EinstellungenSzene') },
      ],
      { abstand: 40, groesse: 26, gesperrt: () => this.wartetAuf !== null },
    );

    this.hinweis = this.add.text(480, 450, '', stil(20, '#ffd166')).setOrigin(0.5);
    this.add
      .text(480, 500, text('tasten.hinweis'), stil(16, '#5d6578'))
      .setOrigin(0.5);

    this.input.keyboard.on('keydown', (ereignis) => this.tasteGedrueckt(ereignis));
  }

  warteAufTaste(aktion) {
    this.wartetAuf = aktion;
    // Phaser meldet denselben Enter-Druck gleich danach noch einmal als allgemeinen Tastendruck
    this.ueberspringeEinmal = true;
    this.hinweis.setText(text('tasten.warte', { aktion: aktionsName(aktion) }));
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
      this.hinweis.setText(text('tasten.abgebrochen'));
    } else if (!name || !belegeTaste(einstellungen, this.farbe, this.wartetAuf, name)) {
      this.hinweis.setText(text('tasten.ungueltig'));
      return;
    } else {
      speichereEinstellungen(einstellungen);
      this.hinweis.setText(`${aktionsName(this.wartetAuf)}: ${tastenName(name)}`);
    }
    this.wartetAuf = null;
    this.menue.aktualisiere();
  }
}
