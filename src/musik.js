// Hintergrundmusik, direkt im Browser erzeugt (Web Audio) – ohne Musikdateien.
// Ein kleiner Sequenzer spielt Achtelnoten: Akkordfläche, Bass, Begleitfigur und (im Gefecht) Schlagzeug.
import { einstellungen } from './einstellungen.js';

// Die Musik soll unter den Effekten bleiben: bei 100 % Musiklautstärke ist sie trotzdem eher leise
const GRUNDLAUTSTAERKE = 0.22;
const VORLAUF = 0.25; // so viele Sekunden im Voraus werden Noten eingeplant
const TAKT = 100; // ms zwischen zwei Planungsdurchläufen

export const frequenz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Jedes Stück: Tempo, Akkorde (je ein Takt aus 8 Achteln) mit Bassnote, Muster der Begleitfigur
// (Index in den Akkord, null = Pause) und ob Schlagzeug dabei ist
export const STUECKE = {
  // ruhig und etwas melancholisch, d-Moll: Dm – B – F – C
  titel: {
    tempo: 72,
    akkorde: [
      { toene: [62, 65, 69], bass: 38 },
      { toene: [58, 62, 65], bass: 34 },
      { toene: [60, 65, 69], bass: 41 },
      { toene: [60, 64, 67], bass: 36 },
    ],
    figur: [0, 1, 2, 1, 0, 2, 1, null],
    flaeche: 0.05,
    schlagzeug: false,
  },
  // treibend und gespannt, a-Moll: Am – Am – F – E
  gefecht: {
    tempo: 116,
    akkorde: [
      { toene: [57, 60, 64], bass: 33 },
      { toene: [57, 60, 64], bass: 33 },
      { toene: [53, 57, 60], bass: 29 },
      { toene: [52, 56, 59], bass: 28 },
    ],
    figur: [null, 2, null, 1, null, 2, 0, 1],
    flaeche: 0.03,
    schlagzeug: true,
  },
};

class Musik {
  constructor() {
    this.ctx = null;
    this.stueck = null;
    this.zeitgeber = null;
  }

  // name = 'titel' oder 'gefecht'; ctx = AudioContext von Phaser (nur beim ersten Aufruf nötig)
  spiele(name, ctx = this.ctx) {
    if (!ctx || (this.stueck === name && this.zeitgeber)) return;
    if (ctx !== this.ctx) {
      this.ctx = ctx;
      this.ausgang = ctx.createGain();
      this.ausgang.connect(ctx.destination);
    }
    this.stopp();
    this.aktualisiereLautstaerke();
    this.stueck = name;
    this.schritt = 0;
    this.naechsteNote = ctx.currentTime + 0.1;
    this.zeitgeber = setInterval(() => this.plane(), TAKT);
    this.plane();
  }

  stopp() {
    clearInterval(this.zeitgeber);
    this.zeitgeber = null;
    this.stueck = null;
  }

  aktualisiereLautstaerke() {
    if (this.ausgang) this.ausgang.gain.setTargetAtTime(einstellungen.musik * GRUNDLAUTSTAERKE, this.ctx.currentTime, 0.05);
  }

  // Plant alle Achtel, die in den nächsten VORLAUF Sekunden fällig werden
  plane() {
    const s = STUECKE[this.stueck];
    const achtel = 60 / s.tempo / 2;
    while (this.naechsteNote < this.ctx.currentTime + VORLAUF) {
      this.spieleAchtel(s, this.schritt, this.naechsteNote, achtel);
      this.schritt++;
      this.naechsteNote += achtel;
    }
  }

  spieleAchtel(s, schritt, t, achtel) {
    const akkord = s.akkorde[Math.floor(schritt / 8) % s.akkorde.length];
    const imTakt = schritt % 8;

    if (imTakt === 0) {
      // Akkordfläche über den ganzen Takt und Bass auf der Eins
      for (const ton of akkord.toene) this.ton(frequenz(ton), t, achtel * 8, 'sine', s.flaeche, 0.3);
      this.ton(frequenz(akkord.bass), t, achtel * 4, 'triangle', 0.18, 0.02);
    }
    if (s.schlagzeug) {
      // Pulsierender Bass auf jeder Achtel, Pauke auf 1 und 5, Becken auf den Zwischenschlägen
      this.ton(frequenz(akkord.bass + (imTakt % 4 === 2 ? 12 : 0)), t, achtel * 0.6, 'square', 0.035, 0.005, 600);
      if (imTakt === 0 || imTakt === 4) this.pauke(t);
      if (imTakt % 2 === 1) this.becken(t);
    }
    const index = s.figur[imTakt];
    if (index !== null) this.ton(frequenz(akkord.toene[index] + 12), t, achtel * 0.9, 'triangle', 0.07, 0.01);
  }

  ton(hz, start, dauer, typ, laut, anschlag, filterHz = null) {
    const ctx = this.ctx;
    const ton = ctx.createOscillator();
    const huelle = ctx.createGain();
    ton.type = typ;
    ton.frequency.value = hz;
    huelle.gain.setValueAtTime(0.0001, start);
    huelle.gain.linearRampToValueAtTime(laut, start + anschlag);
    huelle.gain.exponentialRampToValueAtTime(0.0001, start + dauer);
    let kette = ton.connect(huelle);
    if (filterHz) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterHz;
      kette = huelle.connect(filter);
    }
    kette.connect(this.ausgang);
    ton.start(start);
    ton.stop(start + dauer + 0.05);
  }

  // Tiefer, kurzer Schlag: Sinuston, dessen Tonhöhe schnell fällt
  pauke(start) {
    const ctx = this.ctx;
    const ton = ctx.createOscillator();
    const huelle = ctx.createGain();
    ton.frequency.setValueAtTime(140, start);
    ton.frequency.exponentialRampToValueAtTime(45, start + 0.15);
    huelle.gain.setValueAtTime(0.25, start);
    huelle.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    ton.connect(huelle).connect(this.ausgang);
    ton.start(start);
    ton.stop(start + 0.25);
  }

  // Leises, kurzes Rauschen wie ein geschlossenes Becken
  becken(start) {
    const ctx = this.ctx;
    const puffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate);
    const daten = puffer.getChannelData(0);
    for (let i = 0; i < daten.length; i++) daten[i] = Math.random() * 2 - 1;
    const quelle = ctx.createBufferSource();
    quelle.buffer = puffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const huelle = ctx.createGain();
    huelle.gain.setValueAtTime(0.06, start);
    huelle.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
    quelle.connect(filter).connect(huelle).connect(this.ausgang);
    quelle.start(start);
  }
}

// Die eine Musik des Spiels – sie läuft über Bildschirmwechsel hinweg weiter
export const musik = new Musik();
