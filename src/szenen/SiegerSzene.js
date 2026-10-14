import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';

const TEXTFARBEN = { rot: '#e03b3b', gruen: '#2fbf4f' };
const NAMEN = { rot: 'Rot', gruen: 'Grün' };

// Liegt über der KampfSzene, wenn das Gefecht entschieden ist
export default class SiegerSzene extends Phaser.Scene {
  constructor() {
    super('SiegerSzene');
  }

  init(daten) {
    this.sieger = daten.sieger;
    this.stand = daten.stand;
    this.modus = daten.modus;
  }

  create() {
    this.add.rectangle(480, 270, 960, 540, 0x10141c, 0.88);
    this.add
      .text(480, 150, `${NAMEN[this.sieger]} gewinnt!`, {
        fontFamily: 'sans-serif',
        fontSize: '56px',
        color: TEXTFARBEN[this.sieger],
      })
      .setOrigin(0.5);
    this.add
      .text(480, 215, `${this.stand.rot} : ${this.stand.gruen}`, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    erzeugeMenue(this, 480, 310, [
      { text: 'Revanche', aktion: () => this.revanche() },
      { text: 'Zurück zum Titel', aktion: () => this.zumTitel() },
    ]);
  }

  // Startet die angehaltene KampfSzene neu und schließt dabei diese Szene
  revanche() {
    this.scene.start('KampfSzene', { modus: this.modus });
  }

  zumTitel() {
    this.scene.stop('KampfSzene');
    this.scene.start('TitelSzene');
  }
}
