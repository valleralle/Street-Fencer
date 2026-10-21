import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { text } from '../texte.js';
import { ladeVerlauf, aktuelleWertung, rang, quoten, RAENGE, START } from '../Wertung.js';

// Kurve: so groß und an dieser Stelle (im 960 × 540 großen Bild)
const KURVE = { links: 110, rechts: 790, oben: 168, unten: 388 };

// Wertungszahl, Rang und Verlauf der Gefechte gegen den Computer (Issue #26)
export default class FortschrittSzene extends Phaser.Scene {
  constructor() {
    super('FortschrittSzene');
  }

  create() {
    const verlauf = ladeVerlauf();
    const wertung = aktuelleWertung(verlauf);
    this.add.text(480, 50, text('titel.fortschritt'), stil(48)).setOrigin(0.5);
    this.add
      .text(480, 100, text('fortschritt.wertung', { wertung, rang: text(`rang.${rang(wertung)}`) }), stil(28, '#ffd166'))
      .setOrigin(0.5);
    const naechster = RAENGE.find(([, ab]) => ab > wertung);
    if (naechster) {
      this.add
        .text(480, 134, text('fortschritt.naechsterRang', { rang: text(`rang.${naechster[0]}`), ab: naechster[1] }), stil(18, '#9aa3b5'))
        .setOrigin(0.5);
    }

    if (verlauf.length) {
      this.zeichneKurve([START, ...verlauf.map((g) => g.wertung)]);
      this.add.text(480, 420, text('fortschritt.quoten', quoten(verlauf)), stil(20, '#c8ccd4')).setOrigin(0.5);
    } else {
      this.add.text(480, 270, text('fortschritt.leer'), stil(22, '#9aa3b5')).setOrigin(0.5).setAlign('center').setLineSpacing(10);
    }

    const zurueck = () => this.scene.start('TitelSzene');
    erzeugeMenue(this, 480, 488, [{ text: text('zurueck'), aktion: zurueck }]);
    this.input.keyboard.on('keydown-ESC', zurueck);
  }

  // Wertung über die Gefechte als Linie; die Grenzen der Ränge im sichtbaren Bereich als feine Linien
  zeichneKurve(werte) {
    const { links, rechts, oben, unten } = KURVE;
    const min = Math.floor((Math.min(...werte) - 20) / 50) * 50;
    const max = Math.ceil((Math.max(...werte) + 20) / 50) * 50;
    const x = (i) => links + ((rechts - links) * i) / Math.max(1, werte.length - 1);
    const y = (w) => unten - ((unten - oben) * (w - min)) / (max - min);
    const g = this.add.graphics();

    g.fillStyle(0x1c2230).fillRect(links, oben, rechts - links, unten - oben);
    for (const [name, ab] of RAENGE) {
      if (ab <= min || ab >= max) continue;
      g.fillStyle(0x3a4252).fillRect(links, Math.round(y(ab)), rechts - links, 2);
      this.add.text(rechts + 8, y(ab), text(`rang.${name}`), stil(14, '#5d6578')).setOrigin(0, 0.5);
    }
    this.add.text(links - 8, oben, String(max), stil(14, '#5d6578')).setOrigin(1, 0.5);
    this.add.text(links - 8, unten, String(min), stil(14, '#5d6578')).setOrigin(1, 0.5);

    g.lineStyle(3, 0xffd166);
    g.beginPath();
    werte.forEach((w, i) => (i ? g.lineTo(x(i), y(w)) : g.moveTo(x(i), y(w))));
    g.strokePath();
    g.fillStyle(0xffd166).fillRect(x(werte.length - 1) - 4, y(werte.at(-1)) - 4, 8, 8);
  }
}
