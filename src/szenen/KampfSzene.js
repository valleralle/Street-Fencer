import Phaser from 'phaser';
import Fechter from '../Fechter.js';
import Gefecht from '../Gefecht.js';
import { erzeugeFechterTexturen } from '../pixelart/texturen.js';
import { zeichneHalle, ENDLINIE_LINKS, ENDLINIE_RECHTS, STARTLINIE_ROT, STARTLINIE_GRUEN } from '../kulisse.js';
import Meldegeraet from '../Meldegeraet.js';
import Kamera from '../Kamera.js';
import { halteAbstand } from '../abstand.js';
import Funken from '../Funken.js';
import Statistik from '../Statistik.js';
import { stil } from '../schrift.js';
import { tastaturSteuerung } from '../steuerung.js';
import Computergegner from '../Computergegner.js';
import { signalton, klingenschlag, luftzug } from '../klang.js';
import { FECHTERFARBEN as TEXTFARBEN } from '../farben.js';
import { einstellungen } from '../einstellungen.js';
import { musik } from '../musik.js';



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
      steuerung: tastaturSteuerung(this, einstellungen.tasten.rot),
    });
    this.fechterGruen = new Fechter(this, {
      x: STARTLINIE_GRUEN,
      richtung: -1,
      name: 'gruen',
      steuerung:
        this.computer ??
        tastaturSteuerung(this, einstellungen.tasten.gruen),
    });
    this.funken = new Funken(this);
    musik.spiele('gefecht', this.sound.context);
    this.pausenTasten = [this.input.keyboard.addKey('ESC'), this.input.keyboard.addKey('P')];

    // Nach der Pause alle Tastendrücke verwerfen, die während der Pause passiert sind
    const nachPause = () => {
      this.pauseGedrueckt();
      this.fechterRot.vergissTasten();
      this.fechterGruen.vergissTasten();
    };
    this.events.on('resume', nachPause);
    this.events.once('shutdown', () => this.events.off('resume', nachPause));

    const pausenHinweis = this.add.text(950, 10, 'Esc / P: Pause', stil(16, '#5d6578')).setOrigin(1, 0);

    this.meldegeraet = new Meldegeraet(this);
    this.hinweis = this.add.text(480, 166, '', stil(20, '#c8ccd4')).setOrigin(0.5, 0);
    this.meldung = this.add.text(480, 218, '', stil(48)).setOrigin(0.5);

    this.kamera = new Kamera(this, [...this.meldegeraet.objekte, pausenHinweis, this.hinweis, this.meldung]);

    this.spielZeit = 0;
    this.zeitlupe = false;
    // Eigene Uhr der Szene, die während der Pause stehen bleibt
    this.szenenZeit = 0;
    this.neuesGefecht(0);
  }

  neuesGefecht(zeit) {
    this.gefecht = new Gefecht();
    this.statistik = new Statistik();
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
        const vorher = [rot.x, gruen.x];
        rot.aktualisiere(this.spielZeit, spielDelta, gruen, false);
        gruen.aktualisiere(this.spielZeit, spielDelta, rot, false);
        this.halteAbstand(...vorher);
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
    this.funken.aktualisiere(spielDelta);
    this.kamera.folge(delta, rot, gruen);
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
    const vorher = [rot.x, gruen.x];
    rot.aktualisiere(jetzt, delta, gruen, eingabe);
    gruen.aktualisiere(jetzt, delta, rot, eingabe);
    this.halteAbstand(...vorher);

    // Luftzug in dem Moment, in dem eine Klinge nach vorn schnellt
    for (const f of [rot, gruen]) {
      if (f.stoesst && !f.stiessVorher) {
        luftzug(this.sound.context);
        this.statistik.angriff(f.name);
      }
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
      this.zeigeJubel();
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
      this.statistik.parade(gegner.name);
      // Funken dort, wo die Klingen aufeinandertreffen: kurz vor dem Parierenden, auf Höhe der Spitze
      this.funken.spruehe(gegner.vorderkante + gegner.richtung * 22, angreifer.spitze.y, gegner.richtung);
    } else if (ergebnis === 'treffer') {
      this.treffer[farbe] = true;
      this.statistik.treffer(farbe, angreifer.aktion);
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
    if (this.treffer.rot && this.treffer.gruen) this.statistik.doppeltreffer();
    if (ergebnis === 'gestrichen') {
      this.meldung.setColor('#ffffff').setText('Doppeltreffer – gestrichen');
    } else if (ergebnis === 'doppeltreffer') {
      this.meldung.setColor('#ffffff').setText('Doppeltreffer!');
    } else {
      const farbe = this.treffer.rot ? 'rot' : 'gruen';
      this.meldung.setColor(TEXTFARBEN[farbe]).setText(`Treffer ${NAMEN[farbe]}!`);
      this.fechter(farbe === 'rot' ? 'gruen' : 'rot').zeigePose('getroffen');
    }
    this.zeigeJubel();
    this.zeigeStand();
    this.phase = 'treffer';
    this.phaseStart = zeit;
  }

  fechter(farbe) {
    return farbe === 'rot' ? this.fechterRot : this.fechterGruen;
  }

  // Ist das Gefecht entschieden, jubelt der Sieger
  zeigeJubel() {
    if (this.gefecht.sieger) this.fechter(this.gefecht.sieger).zeigePose('jubel');
  }

  beende(zeit) {
    const { sieger, stand } = this.gefecht;
    this.meldung.setText('');
    this.phase = 'ende';
    this.phaseStart = zeit;
    this.scene.pause();
    this.scene.launch('SiegerSzene', { sieger, stand, modus: this.modus, stufe: this.stufe, statistik: this.statistik.zeilen() });
  }

  zeigeStand() {
    const { stand, restzeit, verlaengerung, vorteil } = this.gefecht;
    const sekunden = Math.ceil(restzeit / 1000);
    this.meldegeraet.zeige(stand, `${Math.floor(sekunden / 60)}:${String(sekunden % 60).padStart(2, '0')}`);
    if (verlaengerung) {
      this.hinweis.setColor(TEXTFARBEN[vorteil]).setText(`Verlängerung · Vorteil ${NAMEN[vorteil]}`);
    }
  }

  halteAbstand(vorherRot, vorherGruen) {
    halteAbstand(this.fechterRot, this.fechterGruen, vorherRot, vorherGruen, {
      links: ENDLINIE_LINKS,
      rechts: ENDLINIE_RECHTS,
    });
  }
}
