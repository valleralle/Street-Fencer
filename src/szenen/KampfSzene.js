import Phaser from 'phaser';
import Fechter, { BODEN_Y, BREITE } from '../Fechter.js';
import Gefecht from '../Gefecht.js';
import { erzeugeFechterTexturen } from '../pixelart/texturen.js';
import { zeichneHalle, ENDLINIE_LINKS, ENDLINIE_RECHTS, STARTLINIE_ROT, STARTLINIE_GRUEN } from '../kulisse.js';
import Meldegeraet from '../Meldegeraet.js';
import { stil } from '../schrift.js';
import { tastaturSteuerung } from '../steuerung.js';
import Computergegner from '../Computergegner.js';
import { signalton, klingenschlag, luftzug } from '../klang.js';

const MIN_ABSTAND = BREITE + 10;

const TEXTFARBEN = { rot: '#e03b3b', gruen: '#2fbf4f' };
const NAMEN = { rot: 'Rot', gruen: 'Grün' };

// Treffer, die so kurz nacheinander landen, zählen als Doppeltreffer
const DOPPELTREFFER_FENSTER = 100;
const PAUSE_NACH_TREFFER = 1500;

// Ab dem ersten Treffer läuft das Spiel langsamer und noch eine Weile nach
const ZEITLUPE_TEMPO = 0.25;
const ZEITLUPE_NACHLAUF = 700;


// Ablauf des Kommandos in Millisekunden; bei „Allez !“ geht es los
const EN_GARDE = 700;
const PRETS = 1400;
const ALLEZ_SICHTBAR = 600;

// Phasen der Szene: 'kommando' → 'gefecht' → 'treffer' → 'kommando' … → 'ende'
export default class KampfSzene extends Phaser.Scene {
  constructor() {
    super('KampfSzene');
  }

  // modus = 'zwei' (zwei Spieler) oder 'computer'; stufe = 'leicht' | 'mittel' | 'schwer'
  init(daten) {
    this.modus = daten.modus ?? 'zwei';
    this.stufe = daten.stufe ?? 'mittel';
  }

  create() {
    zeichneHalle(this);

    erzeugeFechterTexturen(this, 'rot', TEXTFARBEN.rot);
    erzeugeFechterTexturen(this, 'gruen', TEXTFARBEN.gruen);

    // Der Computergegner steht immer rechts und ficht für Grün
    this.computer = this.modus === 'computer' ? new Computergegner(this.stufe) : null;
    this.fechterRot = new Fechter(this, {
      x: STARTLINIE_ROT,
      richtung: 1,
      name: 'rot',
      steuerung: tastaturSteuerung(this, { links: 'A', rechts: 'D', stoss: 'F', parade: 'G', tiefstoss: 'S' }),
    });
    this.fechterGruen = new Fechter(this, {
      x: STARTLINIE_GRUEN,
      richtung: -1,
      name: 'gruen',
      steuerung:
        this.computer ??
        tastaturSteuerung(this, { links: 'LEFT', rechts: 'RIGHT', stoss: 'K', parade: 'L', tiefstoss: 'DOWN' }),
    });
    this.pausenTasten = [this.input.keyboard.addKey('ESC'), this.input.keyboard.addKey('P')];

    // Nach der Pause alle Tastendrücke verwerfen, die während der Pause passiert sind
    const nachPause = () => {
      this.pauseGedrueckt();
      this.fechterRot.vergissTasten();
      this.fechterGruen.vergissTasten();
    };
    this.events.on('resume', nachPause);
    this.events.once('shutdown', () => this.events.off('resume', nachPause));

    this.add.text(950, 10, 'Esc / P: Pause', stil(16, '#5d6578')).setOrigin(1, 0);

    this.meldegeraet = new Meldegeraet(this);
    this.hinweis = this.add.text(480, 166, '', stil(20, '#c8ccd4')).setOrigin(0.5, 0);
    this.meldung = this.add.text(480, 260, '', stil(48)).setOrigin(0.5);

    this.spielZeit = 0;
    this.zeitlupe = false;
    // Eigene Uhr der Szene, die während der Pause stehen bleibt
    this.szenenZeit = 0;
    this.neuesGefecht(0);
  }

  neuesGefecht(zeit) {
    this.gefecht = new Gefecht();
    this.zeigeStand();
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

  update(_, delta) {
    const zeit = (this.szenenZeit += delta);
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
    }

    if (this.pauseGedrueckt() && this.phase !== 'ende') {
      this.scene.pause();
      this.scene.launch('PauseSzene');
    }

    if (this.phase !== 'gefecht') {
      rot.vergissTasten();
      gruen.vergissTasten();
    }
    rot.zeichne();
    gruen.zeichne();
  }

  // Fragt beide Pausentasten ab (und verbraucht ihre Tastendrücke)
  pauseGedrueckt() {
    const gedrueckt = this.pausenTasten.map((t) => Phaser.Input.Keyboard.JustDown(t));
    return gedrueckt.some(Boolean);
  }

  fechte(zeit, delta) {
    const rot = this.fechterRot;
    const gruen = this.fechterGruen;
    const jetzt = this.spielZeit;

    // Nach dem ersten Treffer zählen nur noch Stöße, die schon unterwegs sind
    const eingabe = this.ersterTrefferZeit === null;
    if (this.computer && eingabe) this.computer.denke(jetzt, gruen, rot);
    rot.aktualisiere(jetzt, delta, gruen, eingabe);
    gruen.aktualisiere(jetzt, delta, rot, eingabe);
    this.halteAbstand();

    // Luftzug in dem Moment, in dem eine Klinge nach vorn schnellt
    for (const f of [rot, gruen]) {
      if (f.stoesst && !f.stiessVorher) luftzug(this.sound.context);
      f.stiessVorher = f.stoesst;
    }

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
      klingenschlag(this.sound.context);
    } else if (ergebnis === 'treffer') {
      this.treffer[farbe] = true;
      this.schalteLampe(farbe, true);
      if (this.ersterTrefferZeit === null) {
        this.ersterTrefferZeit = zeit;
        this.zeitlupe = true;
        signalton(this.sound.context);
      }
    }
  }

  schalteLampe(farbe, an) {
    this.meldegeraet.schalteLampe(farbe, an);
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
    this.meldung.setText('');
    this.phase = 'ende';
    this.phaseStart = zeit;
    this.scene.pause();
    this.scene.launch('SiegerSzene', { sieger, stand, modus: this.modus, stufe: this.stufe });
  }

  zeigeStand() {
    const { stand, restzeit, verlaengerung, vorteil } = this.gefecht;
    const sekunden = Math.ceil(restzeit / 1000);
    this.meldegeraet.zeige(stand, `${Math.floor(sekunden / 60)}:${String(sekunden % 60).padStart(2, '0')}`);
    if (verlaengerung) {
      this.hinweis.setColor(TEXTFARBEN[vorteil]).setText(`Verlängerung · Vorteil ${NAMEN[vorteil]}`);
    }
  }

  // Die Fechter können nicht durcheinander hindurch und nicht über die Endlinien
  halteAbstand() {
    const rot = this.fechterRot;
    const gruen = this.fechterGruen;
    const ueberlappung = MIN_ABSTAND - (gruen.x - rot.x);
    if (ueberlappung > 0) {
      rot.x -= ueberlappung / 2;
      gruen.x += ueberlappung / 2;
    }
    rot.x = Phaser.Math.Clamp(rot.x, ENDLINIE_LINKS + BREITE / 2, ENDLINIE_RECHTS - BREITE / 2 - MIN_ABSTAND);
    gruen.x = Phaser.Math.Clamp(gruen.x, rot.x + MIN_ABSTAND, ENDLINIE_RECHTS - BREITE / 2);
  }
}
