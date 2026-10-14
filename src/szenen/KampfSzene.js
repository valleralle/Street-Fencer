import Phaser from 'phaser';
import Fechter, { BODEN_Y, BREITE } from '../Fechter.js';

const WAND_LINKS = 30;
const WAND_RECHTS = 930;
const STARTLINIE_ROT = 352;
const STARTLINIE_GRUEN = 608;
const MIN_ABSTAND = BREITE + 10;

const ROT = 0xe03b3b;
const GRUEN = 0x2fbf4f;

// Treffer, die so kurz nacheinander landen, zählen als Doppeltreffer
const DOPPELTREFFER_FENSTER = 100;
const PAUSE_NACH_TREFFER = 1500;

export default class KampfSzene extends Phaser.Scene {
  constructor() {
    super('KampfSzene');
  }

  create() {
    // Fechtbahn mit Wänden und Startlinien
    this.add.rectangle(480, BODEN_Y + 4, WAND_RECHTS - WAND_LINKS, 8, 0xdddddd);
    this.add.rectangle(WAND_LINKS - 5, BODEN_Y - 60, 10, 140, 0x59627a);
    this.add.rectangle(WAND_RECHTS + 5, BODEN_Y - 60, 10, 140, 0x59627a);
    this.add.rectangle(STARTLINIE_ROT, BODEN_Y + 14, 4, 12, 0xdddddd);
    this.add.rectangle(STARTLINIE_GRUEN, BODEN_Y + 14, 4, 12, 0xdddddd);

    const tasten = (belegung) => this.input.keyboard.addKeys(belegung);
    this.fechterRot = new Fechter(this, {
      x: STARTLINIE_ROT,
      richtung: 1,
      farbe: ROT,
      tasten: tasten({ links: 'A', rechts: 'D', stoss: 'F', parade: 'G', tiefstoss: 'S' }),
    });
    this.fechterGruen = new Fechter(this, {
      x: STARTLINIE_GRUEN,
      richtung: -1,
      farbe: GRUEN,
      tasten: tasten({ links: 'LEFT', rechts: 'RIGHT', stoss: 'K', parade: 'L', tiefstoss: 'DOWN' }),
    });

    const schrift = { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' };
    this.add
      .text(
        480,
        40,
        'Rot: A / D bewegen · F Stoß · G Parade · S Tiefstoß\n' +
          'Grün: ← / → bewegen · K Stoß · L Parade · ↓ Tiefstoß\n' +
          'Ausfall = vorwärts + Stoß · Riposte = Stoß nach gelungener Parade',
        { ...schrift, align: 'center' },
      )
      .setOrigin(0.5, 0);
    this.meldung = this.add.text(480, 220, '', { ...schrift, fontSize: '40px' }).setOrigin(0.5);

    this.treffer = { rot: false, gruen: false };
    this.ersterTrefferZeit = null;
    this.pauseBis = null;
  }

  update(zeit, delta) {
    const rot = this.fechterRot;
    const gruen = this.fechterGruen;

    if (this.pauseBis !== null) {
      if (zeit >= this.pauseBis) this.naechsterAngriff();
    } else {
      rot.aktualisiere(zeit, delta, gruen);
      gruen.aktualisiere(zeit, delta, rot);
      this.halteAbstand();

      this.pruefeStoss(rot, gruen, 'rot', zeit);
      this.pruefeStoss(gruen, rot, 'gruen', zeit);

      if (this.ersterTrefferZeit !== null && zeit - this.ersterTrefferZeit >= DOPPELTREFFER_FENSTER) {
        this.werteTrefferAus(zeit);
      }
    }

    rot.zeichne();
    gruen.zeichne();
  }

  pruefeStoss(angreifer, gegner, farbe, zeit) {
    const ergebnis = angreifer.pruefeStoss(gegner);
    if (ergebnis === 'pariert') {
      angreifer.wurdePariert();
      gegner.paradeGelungen();
    } else if (ergebnis === 'treffer') {
      this.treffer[farbe] = true;
      if (this.ersterTrefferZeit === null) this.ersterTrefferZeit = zeit;
    }
  }

  werteTrefferAus(zeit) {
    const { rot, gruen } = this.treffer;
    if (rot && gruen) this.meldung.setText('Doppeltreffer!').setColor('#ffffff');
    else if (rot) this.meldung.setText('Treffer Rot!').setColor('#e03b3b');
    else this.meldung.setText('Treffer Grün!').setColor('#2fbf4f');
    this.pauseBis = zeit + PAUSE_NACH_TREFFER;
  }

  naechsterAngriff() {
    this.fechterRot.zuruecksetzen();
    this.fechterGruen.zuruecksetzen();
    this.treffer = { rot: false, gruen: false };
    this.ersterTrefferZeit = null;
    this.pauseBis = null;
    this.meldung.setText('');
  }

  // Die Fechter können nicht durcheinander hindurch und nicht durch die Wände
  halteAbstand() {
    const rot = this.fechterRot;
    const gruen = this.fechterGruen;
    const ueberlappung = MIN_ABSTAND - (gruen.x - rot.x);
    if (ueberlappung > 0) {
      rot.x -= ueberlappung / 2;
      gruen.x += ueberlappung / 2;
    }
    rot.x = Phaser.Math.Clamp(rot.x, WAND_LINKS + BREITE / 2, WAND_RECHTS - BREITE / 2 - MIN_ABSTAND);
    gruen.x = Phaser.Math.Clamp(gruen.x, rot.x + MIN_ABSTAND, WAND_RECHTS - BREITE / 2);
  }
}
