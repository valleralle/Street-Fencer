import Phaser from 'phaser';
import Fechter, { BODEN_Y, BREITE } from '../Fechter.js';
import Gefecht from '../Gefecht.js';

const WAND_LINKS = 30;
const WAND_RECHTS = 930;
const STARTLINIE_ROT = 352;
const STARTLINIE_GRUEN = 608;
const MIN_ABSTAND = BREITE + 10;

const FARBEN = { rot: 0xe03b3b, gruen: 0x2fbf4f };
const TEXTFARBEN = { rot: '#e03b3b', gruen: '#2fbf4f' };
const NAMEN = { rot: 'Rot', gruen: 'Grün' };

// Treffer, die so kurz nacheinander landen, zählen als Doppeltreffer
const DOPPELTREFFER_FENSTER = 100;
const PAUSE_NACH_TREFFER = 1500;

// Ab dem ersten Treffer läuft das Spiel langsamer und noch eine Weile nach
const ZEITLUPE_TEMPO = 0.25;
const ZEITLUPE_NACHLAUF = 700;

const LAMPE_AUS = { rot: 0x4a2326, gruen: 0x1d4027 };
const SIGNALTON_HZ = 880;
const SIGNALTON_DAUER = 0.7;

// Ablauf des Kommandos in Millisekunden; bei „Allez !“ geht es los
const EN_GARDE = 700;
const PRETS = 1400;
const ALLEZ_SICHTBAR = 600;

// Phasen der Szene: 'kommando' → 'gefecht' → 'treffer' → 'kommando' … → 'ende'
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
      farbe: FARBEN.rot,
      tasten: tasten({ links: 'A', rechts: 'D', stoss: 'F', parade: 'G', tiefstoss: 'S' }),
    });
    this.fechterGruen = new Fechter(this, {
      x: STARTLINIE_GRUEN,
      richtung: -1,
      farbe: FARBEN.gruen,
      tasten: tasten({ links: 'LEFT', rechts: 'RIGHT', stoss: 'K', parade: 'L', tiefstoss: 'DOWN' }),
    });
    this.leertaste = this.input.keyboard.addKey('SPACE');

    const schrift = { fontFamily: 'sans-serif', color: '#ffffff' };
    this.add
      .text(
        480,
        12,
        'Rot: A / D bewegen · F Stoß · G Parade · S Tiefstoß     ' +
          'Grün: ← / → bewegen · K Stoß · L Parade · ↓ Tiefstoß\n' +
          'Ausfall = vorwärts + Stoß · Riposte = Stoß nach gelungener Parade',
        { ...schrift, fontSize: '13px', align: 'center', color: '#9aa3b5' },
      )
      .setOrigin(0.5, 0);

    // Punktestand und Uhr
    this.punkteRot = this.add.text(450, 80, '0', { ...schrift, fontSize: '56px', color: TEXTFARBEN.rot }).setOrigin(1, 0);
    this.add.text(480, 80, ':', { ...schrift, fontSize: '56px' }).setOrigin(0.5, 0);
    this.punkteGruen = this.add.text(510, 80, '0', { ...schrift, fontSize: '56px', color: TEXTFARBEN.gruen }).setOrigin(0, 0);
    this.uhr = this.add.text(480, 150, '', { ...schrift, fontSize: '24px' }).setOrigin(0.5, 0);
    this.hinweis = this.add.text(480, 182, '', { ...schrift, fontSize: '18px', color: '#c8ccd4' }).setOrigin(0.5, 0);

    this.meldung = this.add.text(480, 250, '', { ...schrift, fontSize: '40px' }).setOrigin(0.5);

    // Trefferanzeige: links die rote, rechts die grüne Lampe, jeweils mit Lichtschein
    this.lampen = {};
    for (const [farbe, x] of [['rot', 340], ['gruen', 620]]) {
      const schein = this.add.circle(x, 112, 34, FARBEN[farbe], 0.25).setVisible(false);
      const lampe = this.add.circle(x, 112, 20, LAMPE_AUS[farbe]);
      this.lampen[farbe] = { schein, lampe };
    }

    this.spielZeit = 0;
    this.zeitlupe = false;
    this.neuesGefecht(this.time.now);
  }

  neuesGefecht(zeit) {
    this.gefecht = new Gefecht();
    this.zeigeStand();
    this.hinweis.setText('');
    this.starteKommando(zeit);
  }

  starteKommando(zeit) {
    this.fechterRot.zuruecksetzen();
    this.fechterGruen.zuruecksetzen();
    this.treffer = { rot: false, gruen: false };
    this.ersterTrefferZeit = null;
    this.zeitlupe = false;
    this.schalteLampe('rot', false);
    this.schalteLampe('gruen', false);
    this.phase = 'kommando';
    this.phaseStart = zeit;
  }

  update(zeit, delta) {
    const rot = this.fechterRot;
    const gruen = this.fechterGruen;
    const seit = zeit - this.phaseStart;
    // Die Fechter laufen auf der Spielzeit, die in der Zeitlupe langsamer vergeht
    const spielDelta = delta * (this.zeitlupe ? ZEITLUPE_TEMPO : 1);

    if (this.phase === 'kommando') {
      this.meldung.setColor('#ffffff').setText(seit < EN_GARDE ? 'En garde !' : 'Prêts ?');
      if (seit >= PRETS) {
        this.meldung.setText('Allez !');
        this.phase = 'gefecht';
        this.phaseStart = zeit;
      }
    } else if (this.phase === 'gefecht') {
      if (seit >= ALLEZ_SICHTBAR && this.meldung.text === 'Allez !') this.meldung.setText('');
      this.spielZeit += spielDelta;
      this.fechte(zeit, spielDelta);
    } else if (this.phase === 'treffer') {
      if (seit < ZEITLUPE_NACHLAUF) {
        this.spielZeit += spielDelta;
        rot.aktualisiere(this.spielZeit, spielDelta, gruen, false);
        gruen.aktualisiere(this.spielZeit, spielDelta, rot, false);
        this.halteAbstand();
      }
      if (seit >= PAUSE_NACH_TREFFER) {
        if (this.gefecht.sieger) this.beende(zeit);
        else this.starteKommando(zeit);
      }
    } else if (this.phase === 'ende') {
      if (Phaser.Input.Keyboard.JustDown(this.leertaste)) this.neuesGefecht(zeit);
    }

    if (this.phase !== 'gefecht') {
      rot.vergissTasten();
      gruen.vergissTasten();
    }
    rot.zeichne();
    gruen.zeichne();
  }

  fechte(zeit, delta) {
    const rot = this.fechterRot;
    const gruen = this.fechterGruen;
    const jetzt = this.spielZeit;

    // Nach dem ersten Treffer zählen nur noch Stöße, die schon unterwegs sind
    const eingabe = this.ersterTrefferZeit === null;
    rot.aktualisiere(jetzt, delta, gruen, eingabe);
    gruen.aktualisiere(jetzt, delta, rot, eingabe);
    this.halteAbstand();

    this.pruefeStoss(rot, gruen, 'rot', jetzt);
    this.pruefeStoss(gruen, rot, 'gruen', jetzt);

    if (this.ersterTrefferZeit !== null) {
      if (jetzt - this.ersterTrefferZeit >= DOPPELTREFFER_FENSTER) this.werteTrefferAus(zeit);
      return;
    }

    const ereignis = this.gefecht.zeitVergeht(delta);
    this.zeigeStand();
    if (ereignis === 'ende') {
      this.meldung.setColor('#ffffff').setText('Zeit !');
      this.phase = 'treffer';
      this.phaseStart = zeit;
    } else if (ereignis === 'verlaengerung') {
      this.meldung.setText('');
      this.starteKommando(zeit);
    }
  }

  pruefeStoss(angreifer, gegner, farbe, zeit) {
    const ergebnis = angreifer.pruefeStoss(gegner);
    if (ergebnis === 'pariert') {
      angreifer.wurdePariert();
      gegner.paradeGelungen();
    } else if (ergebnis === 'treffer') {
      this.treffer[farbe] = true;
      this.schalteLampe(farbe, true);
      if (this.ersterTrefferZeit === null) {
        this.ersterTrefferZeit = zeit;
        this.zeitlupe = true;
        this.signalton();
      }
    }
  }

  schalteLampe(farbe, an) {
    const { schein, lampe } = this.lampen[farbe];
    lampe.setFillStyle(an ? FARBEN[farbe] : LAMPE_AUS[farbe]);
    schein.setVisible(an);
  }

  signalton() {
    const ctx = this.sound.context;
    if (!ctx) return;
    const ton = ctx.createOscillator();
    const lautstaerke = ctx.createGain();
    ton.type = 'square';
    ton.frequency.value = SIGNALTON_HZ;
    lautstaerke.gain.setValueAtTime(0.06, ctx.currentTime);
    lautstaerke.gain.setValueAtTime(0.06, ctx.currentTime + SIGNALTON_DAUER - 0.05);
    lautstaerke.gain.linearRampToValueAtTime(0, ctx.currentTime + SIGNALTON_DAUER);
    ton.connect(lautstaerke).connect(ctx.destination);
    ton.start();
    ton.stop(ctx.currentTime + SIGNALTON_DAUER);
  }

  werteTrefferAus(zeit) {
    const ergebnis = this.gefecht.werteAus(this.treffer);
    if (ergebnis === 'gestrichen') {
      this.meldung.setColor('#ffffff').setText('Doppeltreffer – gestrichen');
    } else if (ergebnis === 'doppeltreffer') {
      this.meldung.setColor('#ffffff').setText('Doppeltreffer!');
    } else {
      const farbe = this.treffer.rot ? 'rot' : 'gruen';
      this.meldung.setColor(TEXTFARBEN[farbe]).setText(`Treffer ${NAMEN[farbe]}!`);
    }
    this.zeigeStand();
    this.phase = 'treffer';
    this.phaseStart = zeit;
  }

  beende(zeit) {
    const { sieger, stand } = this.gefecht;
    this.meldung
      .setColor(TEXTFARBEN[sieger])
      .setText(`${NAMEN[sieger]} gewinnt ${stand.rot}:${stand.gruen}!`);
    this.hinweis.setColor('#c8ccd4').setText('Leertaste: neues Gefecht');
    this.phase = 'ende';
    this.phaseStart = zeit;
  }

  zeigeStand() {
    const { stand, restzeit, verlaengerung, vorteil } = this.gefecht;
    this.punkteRot.setText(String(stand.rot));
    this.punkteGruen.setText(String(stand.gruen));

    const sekunden = Math.ceil(restzeit / 1000);
    const uhrzeit = `${Math.floor(sekunden / 60)}:${String(sekunden % 60).padStart(2, '0')}`;
    this.uhr.setText(verlaengerung ? `Verlängerung ${uhrzeit}` : uhrzeit);
    if (verlaengerung && this.phase !== 'ende') {
      this.hinweis.setColor(TEXTFARBEN[vorteil]).setText(`Vorteil ${NAMEN[vorteil]}`);
    }
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
