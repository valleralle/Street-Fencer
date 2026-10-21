import Phaser from 'phaser';
import Fechter from '../Fechter.js';
import Trainer from '../Trainer.js';
import Funken from '../Funken.js';
import Kamera from '../Kamera.js';
import { LEKTIONEN, bedienung } from '../lektionen.js';
import { halteAbstand } from '../abstand.js';
import { zeichneHalle, ENDLINIE_LINKS, ENDLINIE_RECHTS, STARTLINIE_ROT } from '../kulisse.js';
import { erzeugeFechterTexturen } from '../pixelart/texturen.js';
import { tastaturSteuerung } from '../steuerung.js';
import { istTouchGeraet, touchSteuerung } from '../touch.js';
import { amRechtenRand } from '../bildschirm.js';
import { einstellungen, tastenName } from '../einstellungen.js';
import { signalton, klingenschlag, luftzug } from '../klang.js';
import { FECHTERFARBEN } from '../farben.js';
import { stil } from '../schrift.js';
import { text } from '../texte.js';
import { musik } from '../musik.js';
import { ladeErfolge, speichereErfolge, pruefe } from '../Erfolge.js';
import {
  ladeTraining,
  speichereTraining,
  trageLektionEin,
  alleGeschafft,
  werteReaktionstestAus,
  trageReaktionstestEin,
  REAKTIONSTEST_ANGRIFFE,
  sekunden,
} from '../Trainingswertung.js';

const PAUSE_NACH_TREFFER = 1300;
const PAUSE_NACH_ERFOLG = 2600;
const PAUSE_IM_REAKTIONSTEST = 1000;

// Training gegen einen Trainer; der Spieler ist Rot. modus:
//   'alle'          – Lektion für Lektion ab `lektion`
//   'lektion'       – nur die Lektion `lektion`, danach zurück zur Übersicht
//   'reaktionstest' – Reaktionstest Parade (Issue #24)
// Jede geschaffte Lektion bekommt eine Medaille nach der Zeit bis zum Erfolg.
export default class TrainingSzene extends Phaser.Scene {
  constructor() {
    super('TrainingSzene');
  }

  init(daten) {
    this.modus = daten?.modus ?? 'alle';
    this.ersteLektion = daten?.lektion ?? 0;
  }

  create() {
    zeichneHalle(this);
    erzeugeFechterTexturen(this, 'rot', FECHTERFARBEN.rot);
    erzeugeFechterTexturen(this, 'gruen', FECHTERFARBEN.gruen);

    this.trainer = new Trainer();
    // Auf dem Handy dieselben Knöpfe wie im Gefecht; die Tastatur gilt weiterhin
    const tastatur = tastaturSteuerung(this, einstellungen.tasten.rot);
    this.touch = istTouchGeraet(this) ? touchSteuerung(this, tastatur) : null;
    this.rot = new Fechter(this, {
      x: STARTLINIE_ROT,
      richtung: 1,
      name: 'rot',
      steuerung: this.touch?.steuerung ?? tastatur,
    });
    this.gruen = new Fechter(this, { x: STARTLINIE_ROT + 256, richtung: -1, name: 'gruen', steuerung: this.trainer });
    this.funken = new Funken(this);

    const zurueck = this.touch
      ? this.add.text(944, 14, text('zurueck'), stil(24, '#9aa3b5')).setOrigin(1, 0).setPadding(14)
      : this.add.text(950, 10, text('training.zurueckTasten'), stil(16, '#5d6578')).setOrigin(1, 0);
    const zurUebersicht = () => this.scene.start('TrainingsUebersichtSzene');
    if (this.touch) zurueck.setInteractive().on('pointerdown', zurUebersicht);
    amRechtenRand(this, zurueck, zurueck.x);
    const ui = [
      zurueck,
      (this.nummer = this.add.text(480, 40, '', stil(20, '#9aa3b5')).setOrigin(0.5)),
      (this.titel = this.add.text(480, 80, '', stil(44)).setOrigin(0.5)),
      (this.anleitung = this.add.text(480, 135, '', stil(24, '#ffd166', { align: 'center', wordWrap: { width: 860 } })).setOrigin(0.5, 0)),
      (this.rueckmeldung = this.add.text(480, 200, '', stil(32)).setOrigin(0.5)),
      (this.wertung = this.add.text(480, 226, '', stil(20, '#ffd166', { align: 'center' })).setOrigin(0.5, 0)),
      ...(this.touch?.objekte ?? []),
    ];
    this.kamera = new Kamera(this, ui);

    this.input.keyboard.on('keydown-ESC', zurUebersicht);
    musik.spiele('titel', this.sound.context);

    this.spielZeit = 0;
    this.szenenZeit = 0;
    this.fertig = false;
    this.bestleistungen = ladeTraining();
    if (this.modus === 'reaktionstest') this.starteReaktionstest();
    else this.starteLektion(this.ersteLektion);
  }

  // Bedienung des Spielers für die Anleitungen (Tasten oder Knöpfe)
  bedienung() {
    const tasten = Object.fromEntries(Object.entries(einstellungen.tasten.rot).map(([a, t]) => [a, tastenName(t)]));
    return bedienung(tasten, Boolean(this.touch));
  }

  starteLektion(nummer) {
    this.lektionNummer = nummer;
    this.lektion = LEKTIONEN[nummer];
    const t = this.bedienung();
    this.lektionStart = this.szenenZeit;
    this.wertung.setText('');
    this.nummer.setText(text('training.nummer', { nummer: nummer + 1, gesamt: LEKTIONEN.length }));
    this.titel.setText(this.lektion.titel);
    this.anleitung.setText(this.lektion.text(t));
    this.rueckmeldung.setText('');
    this.aufAnfang();
  }

  // Beide Fechter auf ihre Plätze, der Trainer mit dem Verhalten dieser Lektion
  aufAnfang() {
    this.rot.startX = STARTLINIE_ROT;
    this.gruen.startX = STARTLINIE_ROT + this.lektion.abstand;
    this.rot.zuruecksetzen();
    this.gruen.zuruecksetzen();
    Object.assign(this.trainer, new Trainer(this.lektion.trainer));
    this.trainer.naechsterAngriff = this.spielZeit + (this.modus === 'reaktionstest' ? this.trainer.pause() : 1200);
    this.strecke = 0;
    this.pauseBis = null;
    this.laufenderAngriff = null;
  }

  // Reaktionstest Parade: der Trainer greift REAKTIONSTEST_ANGRIFFE-mal unregelmäßig an
  starteReaktionstest() {
    this.lektion = { trainer: 'reaktionstest', abstand: 180, ziel: () => false };
    this.versuche = [];
    this.nummer.setText(text('reaktionstest.stand', { nummer: 1, gesamt: REAKTIONSTEST_ANGRIFFE }));
    this.titel.setText(text('reaktionstest.titel'));
    this.anleitung.setText(text('reaktionstest.text', { ...this.bedienung(), anzahl: REAKTIONSTEST_ANGRIFFE }));
    this.rueckmeldung.setText('');
    this.aufAnfang();
  }

  // Ein Angriff des Trainers im Reaktionstest ist vorbei: pariert (mit Reaktionszeit) oder nicht
  versuch(pariert, reaktion = null) {
    this.versuche.push({ pariert, reaktion });
    this.laufenderAngriff = null;
    this.rueckmeldung
      .setColor(pariert ? '#7fd18b' : FECHTERFARBEN.rot)
      .setText(pariert ? text('reaktionstest.pariert', { ms: Math.round(reaktion) }) : text('reaktionstest.verpasst'));
    if (!pariert) this.rot.zeigePose('getroffen');
    this.geschafft = false;
    this.pauseBis = this.szenenZeit + PAUSE_IM_REAKTIONSTEST;
  }

  zeigeReaktionstestErgebnis() {
    const ergebnis = werteReaktionstestAus(this.versuche);
    const { daten, bestleistung } = trageReaktionstestEin(this.bestleistungen, ergebnis);
    this.bestleistungen = daten;
    speichereTraining(daten);
    const best = daten.reaktionstest;
    const zeilen = [ergebnis.mittel === null ? text('reaktionstest.keineParade') : text('reaktionstest.mittel', { ms: ergebnis.mittel })];
    if (bestleistung) zeilen.push(text('training.bestleistung'));
    else if (best) zeilen.push(text(best.mittel === null ? 'reaktionstest.bestwertOhneZeit' : 'reaktionstest.bestwert', { ...best, ms: best.mittel }));
    this.beende(text('reaktionstest.ergebnis', ergebnis), [...zeilen, this.weiter()].join('\n'));
  }

  weiter() {
    return text(this.touch ? 'training.weiterTouch' : 'training.weiterTasten');
  }

  // Ende einer Übung: Überschrift und Text, dann mit Enter, Esc oder Antippen zurück zur Übersicht
  beende(titel, anleitung) {
    this.fertig = true;
    this.pauseBis = null;
    this.nummer.setText('');
    this.titel.setText(titel);
    this.anleitung.setText(anleitung);
    this.rueckmeldung.setText('');
    const zurueck = () => this.scene.start('TrainingsUebersichtSzene');
    this.input.keyboard.once('keydown-ENTER', zurueck);
    // Kurz warten, damit ein letztes Antippen der Knöpfe nicht gleich zurückspringt
    if (this.touch) this.time.delayedCall(800, () => this.input.once('pointerdown', zurueck));
  }

  update(_, delta) {
    const zeit = (this.szenenZeit += delta);
    if (this.pauseBis !== null) {
      if (zeit >= this.pauseBis) this.nachDerPause();
      this.rot.vergissTasten();
    } else if (!this.fertig) {
      this.fechte(delta);
    }
    this.funken.aktualisiere(delta);
    this.kamera.folge(delta, this.rot, this.gruen);
    this.rot.zeichne();
    this.gruen.zeichne();
  }

  fechte(delta) {
    const { rot, gruen } = this;
    const jetzt = (this.spielZeit += delta);
    this.trainer.denke(jetzt, gruen, rot);
    const vorher = [rot.x, gruen.x];
    rot.aktualisiere(jetzt, delta, gruen);
    gruen.aktualisiere(jetzt, delta, rot);
    halteAbstand(rot, gruen, ...vorher, { links: ENDLINIE_LINKS, rechts: ENDLINIE_RECHTS });

    this.strecke += Math.abs(rot.x - vorher[0]);
    this.melde({ art: 'bewegt', strecke: this.strecke });

    for (const f of [rot, gruen]) {
      if (f.stoesst && !f.stiessVorher) luftzug(this.sound.context);
      f.stiessVorher = f.stoesst;
    }
    for (const [angreifer, gegner] of [[rot, gruen], [gruen, rot]]) {
      if (this.pauseBis !== null) return;
      const ergebnis = angreifer.pruefeStoss(gegner);
      if (ergebnis === 'pariert') {
        const reaktion = gegner.aktionStart - angreifer.aktionStart; // vom Ausholen bis zur Parade
        angreifer.wurdePariert();
        gegner.paradeGelungen();
        klingenschlag(this.sound.context);
        this.funken.spruehe(gegner.vorderkante + gegner.richtung * 22, angreifer.spitze.y, gegner.richtung);
        if (this.modus === 'reaktionstest') this.versuch(gegner === rot, reaktion);
        else this.melde({ art: 'parade', farbe: gegner.name });
      } else if (ergebnis === 'treffer') {
        signalton(this.sound.context);
        if (this.modus === 'reaktionstest') {
          if (angreifer === gruen) this.versuch(false);
        } else this.melde({ art: 'treffer', farbe: angreifer.name, aktion: angreifer.aktion, nachFinte: angreifer.nachFinte });
      }
    }
    // Reaktionstest: ein Angriff, der ohne Parade und ohne Treffer endet (z. B. ausgewichen), zählt als nicht pariert
    if (this.modus === 'reaktionstest' && this.pauseBis === null) {
      if (gruen.aktion === 'stoss') this.laufenderAngriff ??= gruen.aktionStart;
      else if (this.laufenderAngriff !== null) this.versuch(false);
    }
  }

  melde(ereignis) {
    if (this.lektion.ziel(ereignis)) {
      this.rueckmeldung.setColor('#7fd18b').setText(text('training.gut'));
      this.werteLektion();
      if (ereignis.art === 'treffer') this.gruen.zeigePose('getroffen');
      this.geschafft = true;
      this.pauseBis = this.szenenZeit + PAUSE_NACH_ERFOLG;
    } else if (ereignis.art === 'parade' && ereignis.farbe === 'gruen' && this.lektion.trainer === 'pariert') {
      this.rueckmeldung.setColor('#ffd166').setText(text('training.pariert', { tipp: this.lektion.tipp ?? '' }));
      this.geschafft = false;
      this.pauseBis = this.szenenZeit + PAUSE_NACH_TREFFER;
    } else if (ereignis.art === 'treffer') {
      const getroffen = ereignis.farbe === 'gruen';
      this.rueckmeldung
        .setColor(getroffen ? FECHTERFARBEN.rot : '#ffd166')
        .setText(getroffen ? text('training.getroffen') : this.lektion.tipp ?? text('training.nochmal'));
      (getroffen ? this.rot : this.gruen).zeigePose('getroffen');
      this.geschafft = false;
      this.pauseBis = this.szenenZeit + PAUSE_NACH_TREFFER;
    }
  }

  // Medaille nach der Zeit seit Beginn der Lektion, Bestleistung speichern; sind alle Lektionen
  // geschafft, gibt es den Erfolg „Ausgebildet“ (Issue #23)
  werteLektion() {
    const zeit = this.szenenZeit - this.lektionStart;
    const e = trageLektionEin(this.bestleistungen, this.lektion.id, zeit);
    this.bestleistungen = e.daten;
    speichereTraining(e.daten);
    const zeilen = [text('training.medaille', { medaille: text(`medaille.${e.medaille}`), zeit: sekunden(zeit) })];
    if (e.bestleistung) zeilen.push(text('training.bestleistung'));
    if (alleGeschafft(e.daten)) {
      const { daten, neu } = pruefe(ladeErfolge(), { art: 'training', abgeschlossen: true });
      speichereErfolge(daten);
      zeilen.push(...neu.map((id) => text('erfolge.neu', { titel: text(`erfolg.${id}.titel`) })));
    }
    this.wertung.setText(zeilen);
  }

  nachDerPause() {
    if (this.modus === 'reaktionstest') {
      this.rueckmeldung.setText('');
      if (this.versuche.length >= REAKTIONSTEST_ANGRIFFE) this.zeigeReaktionstestErgebnis();
      else {
        this.nummer.setText(text('reaktionstest.stand', { nummer: this.versuche.length + 1, gesamt: REAKTIONSTEST_ANGRIFFE }));
        this.aufAnfang();
      }
      return;
    }
    if (!this.geschafft) {
      this.rueckmeldung.setText('');
      this.aufAnfang();
      return;
    }
    this.geschafft = false;
    if (this.modus === 'lektion') {
      this.scene.start('TrainingsUebersichtSzene');
      return;
    }
    if (this.lektionNummer + 1 < LEKTIONEN.length) {
      this.starteLektion(this.lektionNummer + 1);
      return;
    }
    // Alle Lektionen geschafft
    this.rot.zeigePose('jubel');
    this.wertung.setText('');
    this.beende(text('training.fertig'), text('training.bereit', { weiter: this.weiter() }));
  }
}
