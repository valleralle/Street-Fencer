import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { FECHTERFARBEN as TEXTFARBEN } from '../farben.js';
import { musik } from '../musik.js';
import { texturName } from '../pixelart/namen.js';
import { MITTE_X, BREITE as BILD_BREITE } from '../pixelart/fechterPosen.js';
import { text, farbname } from '../texte.js';

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
    this.wertung = daten.wertung ?? null;
    this.erfolge = daten.erfolge ?? [];
  }

  create() {
    // Dreimal so groß wie das Bild, damit es auch breite Handybildschirme ganz abdeckt
    this.add.rectangle(480, 270, 3 * 960, 3 * 540, 0x10141c, 0.92);
    musik.spiele('titel', this.sound.context);

    this.add.text(480, 56, text('sieger.gewinnt', { farbe: farbname(this.sieger) }), stil(56, TEXTFARBEN[this.sieger])).setOrigin(0.5);
    this.add.text(480, 110, `${this.stand.rot} : ${this.stand.gruen}`, stil(32)).setOrigin(0.5);

    // Gegen den Computer: Änderung der Wertungszahl und ggf. Aufstieg (Issue #26)
    if (this.wertung) {
      const { aenderung, neu, aufstieg } = this.wertung;
      const zeilen = [text('sieger.wertung', { aenderung: aenderung >= 0 ? `+${aenderung}` : `−${-aenderung}`, wertung: neu })];
      if (aufstieg) zeilen.push(text('sieger.aufstieg', { rang: text(`rang.${aufstieg}`) }));
      this.add.text(190, 150, zeilen, stil(20, aufstieg ? '#ffd166' : '#c8ccd4')).setOrigin(0.5, 0).setAlign('center').setLineSpacing(4);
    }

    // Der Sieger groß in seiner Jubelpose; Grün schaut wie im Gefecht nach links
    const mitte = (MITTE_X + 0.5) / BILD_BREITE;
    const gruen = this.sieger === 'gruen';
    this.add
      .image(190, 440, texturName(this.sieger, 'jubel'))
      .setOrigin(gruen ? 1 - mitte : mitte, 1)
      .setScale(5)
      .setFlipX(gruen);

    // Neu erreichte Erfolge (Issue #23) unter dem Sieger, höchstens drei, dazu „… und n weitere“
    const erfolge = this.erfolge.slice(0, 3).map((id) => text('erfolge.neu', { titel: text(`erfolg.${id}.titel`) }));
    if (this.erfolge.length > 3) erfolge.push(text('erfolge.weitere', { anzahl: this.erfolge.length - 3 }));
    if (erfolge.length) this.add.text(190, 452, erfolge, stil(18, '#ffd166')).setOrigin(0.5, 0).setAlign('center').setLineSpacing(2);

    // Statistik als Tabelle
    const spalten = [460, 700, 820];
    const kopf = [['', farbname('rot'), farbname('gruen')]];
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
        { text: text('sieger.revanche'), aktion: () => this.revanche() },
        { text: text('zurueckZumTitel'), aktion: () => this.zumTitel() },
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
