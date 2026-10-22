import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { text } from '../texte.js';
import { istTouchGeraet } from '../touch.js';
import { ERFOLGE, GRUPPEN, ladeErfolge, fortschritt } from '../Erfolge.js';

const ZEILE = 62; // Höhe eines Erfolgs in der Liste
const OBEN = 168;
const GOLD = '#ffd166';

// Erreichte und offene Erfolge (Issue #23), eine Gruppe pro Seite: ←/→ oder Antippen wechselt die Gruppe
export default class ErfolgeSzene extends Phaser.Scene {
  constructor() {
    super('ErfolgeSzene');
  }

  create() {
    this.daten = ladeErfolge();
    this.gruppe = 0;
    const erreicht = ERFOLGE.filter((e) => this.daten.erreicht[e.id]).length;
    this.add.text(480, 40, text('titel.erfolge'), stil(44)).setOrigin(0.5);
    this.add.text(480, 84, text('erfolge.anzahl', { erreicht, gesamt: ERFOLGE.length }), stil(22, '#9aa3b5')).setOrigin(0.5);

    this.liste = this.add.container(0, 0);
    this.zeigeGruppe();

    const wechsle = (schritte) => () => {
      this.gruppe = (this.gruppe + schritte + GRUPPEN.length) % GRUPPEN.length;
      this.zeigeGruppe();
    };
    const zurueck = () => this.scene.start('TitelSzene');
    erzeugeMenue(
      this,
      480,
      128,
      [
        {
          text: () => `${text(`erfolge.gruppe.${GRUPPEN[this.gruppe]}`)} (${this.gruppe + 1}/${GRUPPEN.length})`,
          links: wechsle(-1),
          rechts: wechsle(1),
        },
        { text: text('zurueck'), aktion: zurueck },
      ],
      { abstand: 364 },
    );
    this.input.keyboard.on('keydown-ESC', zurueck);
    this.add
      .text(480, 532, text(istTouchGeraet(this) ? 'erfolge.hinweisTouch' : 'erfolge.hinweisTasten'), stil(14, '#5d6578'))
      .setOrigin(0.5, 1);
  }

  zeigeGruppe() {
    this.liste.removeAll(true);
    const erfolge = ERFOLGE.filter((e) => e.gruppe === GRUPPEN[this.gruppe]);
    erfolge.forEach((erfolg, i) => {
      const y = OBEN + i * ZEILE;
      const erreicht = Boolean(this.daten.erreicht[erfolg.id]);
      const stand = fortschritt(this.daten, erfolg.id);
      const zeichen = this.add.graphics();
      // Erreicht: gefülltes goldenes Quadrat, offen: nur der Rahmen
      if (erreicht) zeichen.fillStyle(0xffd166).fillRect(150, y + 3, 20, 20);
      else zeichen.lineStyle(3, 0x5d6578).strokeRect(151, y + 4, 18, 18);
      this.liste.add([
        zeichen,
        this.add.text(192, y, text(`erfolg.${erfolg.id}.titel`), stil(22, erreicht ? GOLD : '#c8ccd4')),
        this.add.text(192, y + 28, text(`erfolg.${erfolg.id}.text`), stil(16, erreicht ? '#9aa3b5' : '#5d6578')),
      ]);
      if (stand) {
        this.liste.add(this.add.text(810, y + 2, `${stand.stand}/${stand.ziel}`, stil(20, erreicht ? GOLD : '#9aa3b5')).setOrigin(1, 0));
      }
    });
  }
}
