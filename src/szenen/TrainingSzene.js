import Phaser from 'phaser';
import Fechter from '../Fechter.js';
import Trainer from '../Trainer.js';
import Funken from '../Funken.js';
import Kamera from '../Kamera.js';
import { LEKTIONEN } from '../lektionen.js';
import { halteAbstand } from '../abstand.js';
import { zeichneHalle, ENDLINIE_LINKS, ENDLINIE_RECHTS, STARTLINIE_ROT } from '../kulisse.js';
import { erzeugeFechterTexturen } from '../pixelart/texturen.js';
import { tastaturSteuerung } from '../steuerung.js';
import { einstellungen, tastenName } from '../einstellungen.js';
import { signalton, klingenschlag, luftzug } from '../klang.js';
import { FECHTERFARBEN } from '../farben.js';
import { stil } from '../schrift.js';
import { musik } from '../musik.js';

const PAUSE_NACH_TREFFER = 1300;
const PAUSE_NACH_ERFOLG = 1800;

// Training: Lektion für Lektion gegen einen Trainer. Der Spieler ist Rot.
export default class TrainingSzene extends Phaser.Scene {
  constructor() {
    super('TrainingSzene');
  }

  create() {
    zeichneHalle(this);
    erzeugeFechterTexturen(this, 'rot', FECHTERFARBEN.rot);
    erzeugeFechterTexturen(this, 'gruen', FECHTERFARBEN.gruen);

    this.trainer = new Trainer();
    this.rot = new Fechter(this, {
      x: STARTLINIE_ROT,
      richtung: 1,
      name: 'rot',
      steuerung: tastaturSteuerung(this, einstellungen.tasten.rot),
    });
    this.gruen = new Fechter(this, { x: STARTLINIE_ROT + 256, richtung: -1, name: 'gruen', steuerung: this.trainer });
    this.funken = new Funken(this);

    const ui = [
      this.add.text(950, 10, 'Esc: zurück zum Titel', stil(16, '#5d6578')).setOrigin(1, 0),
      (this.nummer = this.add.text(480, 40, '', stil(20, '#9aa3b5')).setOrigin(0.5)),
      (this.titel = this.add.text(480, 80, '', stil(44)).setOrigin(0.5)),
      (this.anleitung = this.add.text(480, 135, '', stil(24, '#ffd166', { align: 'center', wordWrap: { width: 860 } })).setOrigin(0.5, 0)),
      (this.rueckmeldung = this.add.text(480, 215, '', stil(32)).setOrigin(0.5)),
    ];
    this.kamera = new Kamera(this, ui);

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('TitelSzene'));
    musik.spiele('titel', this.sound.context);

    this.spielZeit = 0;
    this.szenenZeit = 0;
    this.starteLektion(0);
  }

  starteLektion(nummer) {
    this.lektionNummer = nummer;
    this.lektion = LEKTIONEN[nummer];
    const tasten = Object.fromEntries(Object.entries(einstellungen.tasten.rot).map(([a, t]) => [a, tastenName(t)]));
    this.nummer.setText(`Training · Lektion ${nummer + 1} von ${LEKTIONEN.length}`);
    this.titel.setText(this.lektion.titel);
    this.anleitung.setText(this.lektion.text(tasten));
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
    this.trainer.naechsterAngriff = this.spielZeit + 1200;
    this.strecke = 0;
    this.pauseBis = null;
  }

  update(_, delta) {
    const zeit = (this.szenenZeit += delta);
    if (this.pauseBis !== null) {
      if (zeit >= this.pauseBis) this.nachDerPause();
      this.rot.vergissTasten();
    } else if (this.lektionNummer < LEKTIONEN.length) {
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
        angreifer.wurdePariert();
        gegner.paradeGelungen();
        klingenschlag(this.sound.context);
        this.funken.spruehe(gegner.vorderkante + gegner.richtung * 22, angreifer.spitze.y, gegner.richtung);
        this.melde({ art: 'parade', farbe: gegner.name });
      } else if (ergebnis === 'treffer') {
        signalton(this.sound.context);
        this.melde({ art: 'treffer', farbe: angreifer.name, aktion: angreifer.aktion });
      }
    }
  }

  melde(ereignis) {
    if (this.lektion.ziel(ereignis)) {
      this.rueckmeldung.setColor('#7fd18b').setText('Gut gemacht!');
      if (ereignis.art === 'treffer') this.gruen.zeigePose('getroffen');
      this.geschafft = true;
      this.pauseBis = this.szenenZeit + PAUSE_NACH_ERFOLG;
    } else if (ereignis.art === 'treffer') {
      const getroffen = ereignis.farbe === 'gruen';
      this.rueckmeldung
        .setColor(getroffen ? FECHTERFARBEN.rot : '#ffd166')
        .setText(getroffen ? 'Getroffen – noch einmal!' : this.lektion.tipp ?? 'Noch einmal!');
      (getroffen ? this.rot : this.gruen).zeigePose('getroffen');
      this.geschafft = false;
      this.pauseBis = this.szenenZeit + PAUSE_NACH_TREFFER;
    }
  }

  nachDerPause() {
    if (!this.geschafft) {
      this.rueckmeldung.setText('');
      this.aufAnfang();
      return;
    }
    this.geschafft = false;
    if (this.lektionNummer + 1 < LEKTIONEN.length) {
      this.starteLektion(this.lektionNummer + 1);
      return;
    }
    // Alle Lektionen geschafft
    this.lektionNummer = LEKTIONEN.length;
    this.pauseBis = null;
    this.rot.zeigePose('jubel');
    this.nummer.setText('');
    this.titel.setText('Training abgeschlossen!');
    this.anleitung.setText('Jetzt bist du bereit für ein Gefecht.\nEnter oder Esc: zurück zum Titel');
    this.rueckmeldung.setText('');
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('TitelSzene'));
  }
}
