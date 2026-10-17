import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { FECHTERFARBEN as TEXTFARBEN } from '../farben.js';
import { musik } from '../musik.js';
import { texturName } from '../pixelart/namen.js';
import { MITTE_X, BREITE as BILD_BREITE } from '../pixelart/fechterPosen.js';

const NAMEN = { rot: 'Rot', gruen: 'Grün' };

// Liegt über der KampfSzene, wenn das Gefecht entschieden ist: Sieger, Endstand, Statistik
export default class SiegerSzene extends Phaser.Scene {
  constructor() {
    super('SiegerSzene');
  }

  init(daten) {
    this.sieger = daten.sieger;
    this.stand = daten.stand;
    this.modus = daten.modus;
    this.stufe = daten.stufe;
    this.statistik = daten.statistik ?? [];
  }

  create() {
    // Dreimal so groß wie das Bild, damit es auch breite Handybildschirme ganz abdeckt
    this.add.rectangle(480, 270, 3 * 960, 3 * 540, 0x10141c, 0.92);
    musik.spiele('titel', this.sound.context);

    this.add.text(480, 56, `${NAMEN[this.sieger]} gewinnt!`, stil(56, TEXTFARBEN[this.sieger])).setOrigin(0.5);
    this.add.text(480, 110, `${this.stand.rot} : ${this.stand.gruen}`, stil(32)).setOrigin(0.5);

    // Der Sieger groß in seiner Jubelpose; Grün schaut wie im Gefecht nach links
    const mitte = (MITTE_X + 0.5) / BILD_BREITE;
    const gruen = this.sieger === 'gruen';
    this.add
      .image(190, 440, texturName(this.sieger, 'jubel'))
      .setOrigin(gruen ? 1 - mitte : mitte, 1)
      .setScale(5)
      .setFlipX(gruen);

    // Statistik als Tabelle
    const spalten = [460, 700, 820];
    const kopf = [['', 'Rot', 'Grün']];
    [...kopf, ...this.statistik].forEach((zeile, z) => {
      zeile.forEach((zelle, s) => {
        const farbe = z === 0 ? ['#ffffff', TEXTFARBEN.rot, TEXTFARBEN.gruen][s] : s === 0 ? '#9aa3b5' : '#ffffff';
        this.add.text(spalten[s], 160 + z * 34, zelle, stil(22, farbe)).setOrigin(s === 0 ? 0 : 0.5, 0.5);
      });
    });

    erzeugeMenue(
      this,
      650,
      430,
      [
        { text: 'Revanche', aktion: () => this.revanche() },
        { text: 'Zurück zum Titel', aktion: () => this.zumTitel() },
      ],
      { abstand: 42 },
    );
  }

  // Startet die angehaltene KampfSzene neu und schließt dabei diese Szene
  revanche() {
    this.scene.start('KampfSzene', { modus: this.modus, stufe: this.stufe });
  }

  zumTitel() {
    this.scene.stop('KampfSzene');
    this.scene.start('TitelSzene');
  }
}
