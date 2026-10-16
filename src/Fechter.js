import { BREITE as BILD_BREITE, HOEHE as BILD_HOEHE, MITTE_X, POSEN } from './pixelart/fechterPosen.js';
import { texturName } from './pixelart/namen.js';

export const BODEN_Y = 440;
export const BREITE = 36;

const HOEHE_STEHEND = 100;
const HOEHE_GEDUCKT = 60;
const TEMPO = 220;
const KLINGE_RUHE = 45;

// Die Pixelbilder werden 2-fach vergrößert; ein Bildpixel sind also 2 Bildschirmpixel
const MASSSTAB = 2;
// Beim Gehen wechselt das Bild alle so viele Bildschirmpixel
const SCHRITTLAENGE = 14;
// Halbe Breite der Glocke am Degen in Bildpixeln
const GLOCKE_RADIUS = 3;
// Höhe des vorderen Fußes, der beim Ausfall zur Trefffläche gehört
const FUSS_HOEHE = 20;

// Für jede Pose die äußersten Spalten der Schuhe – dort liegt der Schatten
const SCHUH_SPALTEN = Object.fromEntries(
  Object.entries(POSEN).map(([pose, { pixel }]) => {
    const spalten = pixel.flatMap((zeile) => [...zeile].flatMap((z, x) => (z === 'S' ? [x] : [])));
    return [pose, [Math.min(...spalten), Math.max(...spalten) + 1]];
  }),
);

// Höhen, auf die die Degenspitze zielt
const HOCH = BODEN_Y - 70;
const MITTEL = BODEN_Y - 40; // Stoß gegen einen Gegner, der schon geduckt ist
const TIEF = BODEN_Y - 8;

// Zeiten in Millisekunden; reichweite = Länge der Klinge während der aktiven Phase.
// Ein Mensch braucht etwa 200–250 ms, um auf etwas zu reagieren. Damit man einen Angriff
// parieren kann, muss sein Anlauf (das Ausholen) länger dauern.
const AKTIONEN = {
  stoss: { anlauf: 300, aktiv: 120, erholung: 220, reichweite: 95 },
  riposte: { anlauf: 80, aktiv: 120, erholung: 160, reichweite: 95 },
  ausfall: { anlauf: 350, aktiv: 150, erholung: 450, reichweite: 95, schritt: 80 },
  // Abtauchen geht schnell (ducken), der Stoß zum Fuß kommt erst nach dem langen Anlauf –
  // so bleibt Zeit, in den Geduckten hineinzustoßen
  tiefstoss: { ducken: 40, anlauf: 650, aktiv: 180, erholung: 300, reichweite: 85 },
  parade: { anlauf: 0, aktiv: 300, erholung: 300 },
};
const ANGRIFFE = ['stoss', 'riposte', 'ausfall', 'tiefstoss'];

// Wie lange ein parierter Angreifer offen ist bzw. wie lange nach einer Parade eine Riposte möglich ist
const OFFEN_DAUER = 500;
const RIPOSTE_FENSTER = 400;

export default class Fechter {
  // name = 'rot' oder 'gruen' (für die Texturen); steuerung = Tastatur oder Computergegner.
  // Ohne szene (z. B. in Tests) gibt es keine Grafik, die Spiellogik funktioniert trotzdem.
  constructor(szene, { x, richtung, name, steuerung }) {
    this.startX = x;
    this.richtung = richtung; // 1 = schaut nach rechts, -1 = nach links
    this.name = name;
    this.steuerung = steuerung;
    this.jetzt = 0;
    this.zuruecksetzen();
    if (!szene) return;

    // Grün ist das gespiegelte Bild von Rot; die Rumpfmitte bleibt dabei über x
    const mitte = (MITTE_X + 0.5) / BILD_BREITE;
    this.schatten = szene.add.graphics();
    this.bild = szene.add
      .image(x, BODEN_Y, texturName(name, 'grundstellung'))
      .setOrigin(richtung > 0 ? mitte : 1 - mitte, 1)
      .setScale(MASSSTAB)
      .setFlipX(richtung < 0);
    this.klinge = szene.add.graphics();
  }

  zuruecksetzen() {
    this.x = this.startX;
    this.aktion = null;
    this.aktionStart = 0;
    this.zielHoehe = HOCH;
    this.verbraucht = false;
    this.offenBis = 0;
    this.riposteBis = 0;
    this.geht = false;
  }

  get phase() {
    if (!this.aktion) return null;
    const a = AKTIONEN[this.aktion];
    const t = this.jetzt - this.aktionStart;
    if (t < a.anlauf) return 'anlauf';
    if (t < a.anlauf + a.aktiv) return 'aktiv';
    if (t < a.anlauf + a.aktiv + a.erholung) return 'erholung';
    return null;
  }

  get geduckt() {
    return this.aktion === 'tiefstoss' && this.jetzt - this.aktionStart >= AKTIONEN.tiefstoss.ducken;
  }

  // Die Klinge ist gerade vorn: ein Angriff in seiner aktiven Phase
  get stoesst() {
    return ANGRIFFE.includes(this.aktion) && this.phase === 'aktiv';
  }

  get pariert() {
    return this.aktion === 'parade' && this.phase === 'aktiv';
  }

  get offen() {
    return this.jetzt < this.offenBis;
  }

  get kannRiposte() {
    return this.jetzt < this.riposteBis;
  }

  // Liste von Rechtecken: der Körper und beim Ausfall zusätzlich der vordere Fuß
  get treffflaechen() {
    const hoehe = this.geduckt ? HOEHE_GEDUCKT : HOEHE_STEHEND;
    const koerper = { links: this.x - BREITE / 2, rechts: this.x + BREITE / 2, oben: BODEN_Y - hoehe, unten: BODEN_Y };
    if (this.aktion !== 'ausfall') return [koerper];

    const fussX = this.x + this.richtung * this.bildAbstand(POSEN.ausfall.vordererFuss + 1);
    const fuss = {
      links: Math.min(this.x, fussX),
      rechts: Math.max(this.x, fussX),
      oben: BODEN_Y - FUSS_HOEHE,
      unten: BODEN_Y,
    };
    return [koerper, fuss];
  }

  // Abstand einer Bildspalte von der Rumpfmitte in Bildschirmpixeln
  bildAbstand(spalte) {
    return (spalte - (MITTE_X + 0.5)) * MASSSTAB;
  }

  get pose() {
    if (this.offen && !this.aktion) return 'offen';
    switch (this.aktion) {
      case 'stoss':
      case 'riposte':
        return this.phase === 'aktiv' ? 'stoss' : 'grundstellung';
      case 'ausfall':
        return 'ausfall';
      case 'parade':
        return this.phase === 'aktiv' ? 'parade' : 'grundstellung';
      case 'tiefstoss':
        return this.geduckt ? 'tiefstoss' : 'grundstellung';
    }
    if (this.geht) return Math.floor(this.x / SCHRITTLAENGE) % 2 ? 'gehen1' : 'gehen2';
    return 'grundstellung';
  }

  get hand() {
    const [spalte, zeile] = POSEN[this.pose].hand;
    return {
      x: this.x + this.richtung * this.bildAbstand(spalte + 0.5),
      y: BODEN_Y - (BILD_HOEHE - zeile - 0.5) * MASSSTAB,
    };
  }

  get vorderkante() {
    return this.x + (this.richtung * BREITE) / 2;
  }

  get spitze() {
    if (this.aktion === 'parade') {
      return { x: this.vorderkante + this.richtung * 25, y: BODEN_Y - HOEHE_STEHEND - 15 };
    }
    let laenge = KLINGE_RUHE;
    if (ANGRIFFE.includes(this.aktion)) {
      if (this.phase === 'anlauf') laenge = KLINGE_RUHE - 25; // sichtbares Ausholen
      if (this.phase === 'aktiv') laenge = AKTIONEN[this.aktion].reichweite;
    }
    if (this.offen && !this.aktion) {
      // Nach einer gegnerischen Parade hängt die Klinge nach unten
      const h = this.hand;
      return { x: h.x + this.richtung * 30, y: h.y + 20 };
    }
    const y = ANGRIFFE.includes(this.aktion) ? this.zielHoehe : HOCH;
    return { x: this.vorderkante + this.richtung * laenge, y };
  }

  // eingabe = false: laufende Aktionen gehen weiter, neue werden nicht angenommen
  aktualisiere(jetzt, delta, gegner, eingabe = true) {
    this.jetzt = jetzt;
    this.gegner = gegner;
    if (this.aktion && this.phase === null) this.aktion = null;

    // Tastendrücke immer abholen, damit sie nicht während einer Aktion „hängen bleiben“
    const s = this.steuerung;
    const stoss = s.gedrueckt('stoss');
    const parade = s.gedrueckt('parade');
    const tiefstoss = s.gedrueckt('tiefstoss');

    const vor = s.gehalten(this.richtung > 0 ? 'rechts' : 'links');
    const zurueck = s.gehalten(this.richtung > 0 ? 'links' : 'rechts');

    if (eingabe && !this.aktion && !this.offen) {
      if (stoss) {
        if (this.kannRiposte) this.starte('riposte', gegner);
        else if (vor) this.starte('ausfall', gegner);
        else this.starte('stoss', gegner);
      } else if (parade) {
        this.starte('parade', gegner);
      } else if (tiefstoss) {
        this.starte('tiefstoss', gegner);
      } else {
        let v = 0;
        if (vor) v += TEMPO;
        if (zurueck) v -= TEMPO;
        this.x += (this.richtung * v * delta) / 1000;
        this.geht = v !== 0;
      }
    }
    if (this.aktion || this.offen || !eingabe) this.geht = false;

    // Beim Ausfall springt der Fechter während Anlauf und Stoß nach vorn
    if (this.aktion === 'ausfall' && this.phase !== 'erholung') {
      const a = AKTIONEN.ausfall;
      this.x += (this.richtung * a.schritt * delta) / (a.anlauf + a.aktiv);
    }
  }

  // Tastendrücke außerhalb des Gefechts (z. B. während des Kommandos) verwerfen
  vergissTasten() {
    for (const taste of ['stoss', 'parade', 'tiefstoss']) this.steuerung.gedrueckt(taste);
  }

  starte(aktion, gegner) {
    this.aktion = aktion;
    this.aktionStart = this.jetzt;
    this.verbraucht = false;
    this.riposteBis = 0;
    if (aktion === 'tiefstoss') this.zielHoehe = TIEF;
    else this.zielHoehe = gegner.geduckt ? MITTEL : HOCH;
  }

  // Liefert 'treffer', 'pariert' oder null
  pruefeStoss(gegner) {
    if (!ANGRIFFE.includes(this.aktion) || this.phase !== 'aktiv' || this.verbraucht) return null;
    const s = this.spitze;
    const getroffen = gegner.treffflaechen.some((f) => {
      const erreicht = this.richtung > 0 ? s.x >= f.links : s.x <= f.rechts;
      return erreicht && s.y >= f.oben && s.y <= f.unten;
    });
    if (!getroffen) return null;

    this.verbraucht = true;
    // Eine Parade schlägt nur hohe Klingen weg, ein Tiefstoß geht darunter durch
    if (gegner.pariert && this.zielHoehe !== TIEF) return 'pariert';
    return 'treffer';
  }

  wurdePariert() {
    this.aktion = null;
    this.offenBis = this.jetzt + OFFEN_DAUER;
  }

  paradeGelungen() {
    this.aktion = null;
    this.riposteBis = this.jetzt + RIPOSTE_FENSTER;
  }

  zeichne() {
    if (!this.bild) return;
    this.bild.setPosition(this.x, BODEN_Y).setTexture(texturName(this.name, this.pose));

    // Schatten auf der Fechtbahn: ein flaches Oval unter den Schuhen
    const [von, bis] = SCHUH_SPALTEN[this.pose].map((s) => this.x + this.richtung * this.bildAbstand(s));
    const links = Math.min(von, bis) - 4;
    const breite = Math.abs(bis - von) + 8;
    this.schatten.clear().fillStyle(0x000000, 0.35);
    this.schatten.fillRect(links + 4, BODEN_Y - 4, breite - 8, 2).fillRect(links, BODEN_Y - 2, breite, 4).fillRect(links + 4, BODEN_Y + 2, breite - 8, 2);

    // Degen im Pixelstil: von der Hand bis zur Spitze aus Quadraten mit Bildpixelgröße
    const g = this.klinge;
    const h = this.hand;
    const s = { ...this.spitze };
    // Die Klinge endet am Körper des Gegners, statt durch ihn hindurchzugehen
    for (const f of this.gegner?.treffflaechen ?? []) {
      const kante = this.richtung > 0 ? f.links : f.rechts;
      const vorKante = this.richtung * (kante - h.x) > 0;
      const durch = this.richtung * (s.x - kante) > 0;
      if (vorKante && durch && s.y >= f.oben && s.y <= f.unten) s.x = kante;
    }
    const pixel = (x, y) =>
      g.fillRect(Math.floor(x / MASSSTAB) * MASSSTAB, Math.floor(y / MASSSTAB) * MASSSTAB, MASSSTAB, MASSSTAB);
    g.clear();
    g.fillStyle(0xc8ccd4);
    const schritte = Math.ceil(Math.max(Math.abs(s.x - h.x), Math.abs(s.y - h.y)) / MASSSTAB);
    for (let i = 0; i <= schritte; i++) {
      pixel(h.x + ((s.x - h.x) * i) / schritte, h.y + ((s.y - h.y) * i) / schritte);
    }

    // Glocke (Handschutz des Degens): eine nach vorn gewölbte Scheibe quer zur Klinge, kurz vor der Hand
    const laenge = Math.hypot(s.x - h.x, s.y - h.y) || 1;
    const [vx, vy] = [(s.x - h.x) / laenge, (s.y - h.y) / laenge]; // entlang der Klinge
    const [qx, qy] = [-vy, vx]; // quer zur Klinge
    for (let q = -GLOCKE_RADIUS; q <= GLOCKE_RADIUS; q++) {
      // in der Mitte am weitesten vorn, zum Rand hin nach hinten gewölbt
      const vor = 2 - Math.round((q * q) / (GLOCKE_RADIUS * 2));
      g.fillStyle(Math.abs(q) === GLOCKE_RADIUS ? 0x8e95a3 : 0xd8dce4);
      pixel(h.x + (vx * vor + qx * q) * MASSSTAB, h.y + (vy * vor + qy * q) * MASSSTAB);
    }
  }
}
