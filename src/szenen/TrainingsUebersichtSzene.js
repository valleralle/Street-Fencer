import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { text } from '../texte.js';
import { istTouchGeraet } from '../touch.js';
import { LEKTIONEN } from '../lektionen.js';
import { ladeTraining, besteMedaille, sekunden } from '../Trainingswertung.js';

const OBEN = 112;
const ABSTAND = 36;
const FARBEN = { gold: 0xffd166, silber: 0xc8ccd4, bronze: 0xcd7f32 };

// Übersicht des Trainings (Issue #24): alle Lektionen nacheinander, jede Lektion einzeln mit ihrer
// besten Medaille und Zeit, und der Reaktionstest Parade mit Bestwert
export default class TrainingsUebersichtSzene extends Phaser.Scene {
  constructor() {
    super('TrainingsUebersichtSzene');
  }

  create() {
    const daten = ladeTraining();
    const starte = (modus, lektion = 0) => () => this.scene.start('TrainingSzene', { modus, lektion });
    this.add.text(480, 52, text('titel.training'), stil(48)).setOrigin(0.5);

    const eintraege = [
      { text: text('training.alle'), aktion: starte('alle') },
      ...LEKTIONEN.map((l, i) => ({ text: `${i + 1}. ${l.titel}`, aktion: starte('lektion', i) })),
      {
        text: daten.reaktionstest ? text('reaktionstest.mitBestwert', daten.reaktionstest) : text('reaktionstest.titel'),
        aktion: starte('reaktionstest'),
      },
      { text: text('zurueck'), aktion: () => this.scene.start('TitelSzene') },
    ];
    erzeugeMenue(this, 480, OBEN, eintraege, { abstand: ABSTAND, groesse: 24 });
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('TitelSzene'));

    // Beste Medaille links neben jeder Lektion, Bestzeit rechts daneben
    const g = this.add.graphics();
    LEKTIONEN.forEach((l, i) => {
      const y = OBEN + (i + 1) * ABSTAND;
      const medaille = besteMedaille(daten, l.id);
      if (medaille) g.fillStyle(FARBEN[medaille]).fillCircle(300, y, 9);
      else g.lineStyle(2, 0x5d6578).strokeCircle(300, y, 8);
      const zeit = daten.lektionen[l.id];
      if (zeit !== undefined) this.add.text(660, y, sekunden(zeit), stil(18, '#9aa3b5')).setOrigin(0, 0.5);
    });

    this.add
      .text(480, 530, text(istTouchGeraet(this) ? 'titel.hinweisTouch' : 'titel.hinweisTasten'), stil(16, '#5d6578'))
      .setOrigin(0.5, 1);
  }
}
