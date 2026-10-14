import Phaser from 'phaser';

export const BODEN_Y = 440;
export const BREITE = 36;

const HOEHE_STEHEND = 100;
const HOEHE_GEDUCKT = 60;
const TEMPO = 220;
const KLINGE_RUHE = 45;

// Höhen, auf die die Degenspitze zielt
const HOCH = BODEN_Y - 70;
const MITTEL = BODEN_Y - 40; // Stoß gegen einen Gegner, der schon geduckt ist
const TIEF = BODEN_Y - 8;

// Zeiten in Millisekunden; reichweite = Länge der Klinge während der aktiven Phase
const AKTIONEN = {
  stoss: { anlauf: 80, aktiv: 120, erholung: 220, reichweite: 95 },
  riposte: { anlauf: 30, aktiv: 120, erholung: 160, reichweite: 95 },
  ausfall: { anlauf: 120, aktiv: 150, erholung: 450, reichweite: 95, schritt: 80 },
  // Abtauchen geht schnell (ducken), der Stoß zum Fuß kommt erst nach dem Anlauf
  tiefstoss: { ducken: 40, anlauf: 150, aktiv: 180, erholung: 300, reichweite: 85 },
  parade: { anlauf: 0, aktiv: 200, erholung: 300 },
};
const ANGRIFFE = ['stoss', 'riposte', 'ausfall', 'tiefstoss'];

// Wie lange ein parierter Angreifer offen ist bzw. wie lange nach einer Parade eine Riposte möglich ist
const OFFEN_DAUER = 500;
const RIPOSTE_FENSTER = 400;

export default class Fechter {
  constructor(szene, { x, richtung, farbe, tasten }) {
    this.startX = x;
    this.richtung = richtung; // 1 = schaut nach rechts, -1 = nach links
    this.farbe = farbe;
    this.tasten = tasten;
    this.grafik = szene.add.graphics();
    this.jetzt = 0;
    this.zuruecksetzen();
  }

  zuruecksetzen() {
    this.x = this.startX;
    this.aktion = null;
    this.aktionStart = 0;
    this.zielHoehe = HOCH;
    this.verbraucht = false;
    this.offenBis = 0;
    this.riposteBis = 0;
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

  get pariert() {
    return this.aktion === 'parade' && this.phase === 'aktiv';
  }

  get offen() {
    return this.jetzt < this.offenBis;
  }

  get treffflaeche() {
    const hoehe = this.geduckt ? HOEHE_GEDUCKT : HOEHE_STEHEND;
    return {
      links: this.x - BREITE / 2,
      rechts: this.x + BREITE / 2,
      oben: BODEN_Y - hoehe,
      unten: BODEN_Y,
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
      if (this.phase === 'anlauf') laenge = KLINGE_RUHE - 15;
      if (this.phase === 'aktiv') laenge = AKTIONEN[this.aktion].reichweite;
    }
    const y = ANGRIFFE.includes(this.aktion) ? this.zielHoehe : HOCH;
    return { x: this.vorderkante + this.richtung * laenge, y };
  }

  aktualisiere(jetzt, delta, gegner) {
    this.jetzt = jetzt;
    if (this.aktion && this.phase === null) this.aktion = null;

    // Tastendrücke immer abholen, damit sie nicht während einer Aktion „hängen bleiben“
    const JustDown = Phaser.Input.Keyboard.JustDown;
    const stoss = JustDown(this.tasten.stoss);
    const parade = JustDown(this.tasten.parade);
    const tiefstoss = JustDown(this.tasten.tiefstoss);

    const vor = this.richtung > 0 ? this.tasten.rechts : this.tasten.links;
    const zurueck = this.richtung > 0 ? this.tasten.links : this.tasten.rechts;

    if (!this.aktion && !this.offen) {
      if (stoss) {
        if (jetzt < this.riposteBis) this.starte('riposte', gegner);
        else if (vor.isDown) this.starte('ausfall', gegner);
        else this.starte('stoss', gegner);
      } else if (parade) {
        this.starte('parade', gegner);
      } else if (tiefstoss) {
        this.starte('tiefstoss', gegner);
      } else {
        let v = 0;
        if (vor.isDown) v += TEMPO;
        if (zurueck.isDown) v -= TEMPO;
        this.x += (this.richtung * v * delta) / 1000;
      }
    }

    // Beim Ausfall springt der Fechter während Anlauf und Stoß nach vorn
    if (this.aktion === 'ausfall' && this.phase !== 'erholung') {
      const a = AKTIONEN.ausfall;
      this.x += (this.richtung * a.schritt * delta) / (a.anlauf + a.aktiv);
    }
  }

  // Tastendrücke außerhalb des Gefechts (z. B. während des Kommandos) verwerfen
  vergissTasten() {
    const JustDown = Phaser.Input.Keyboard.JustDown;
    JustDown(this.tasten.stoss);
    JustDown(this.tasten.parade);
    JustDown(this.tasten.tiefstoss);
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
    const f = gegner.treffflaeche;
    const erreicht = this.richtung > 0 ? s.x >= f.links : s.x <= f.rechts;
    if (!erreicht || s.y < f.oben || s.y > f.unten) return null;

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
    const g = this.grafik;
    const f = this.treffflaeche;
    g.clear();

    // Anzug, Maske, Schuhe
    g.fillStyle(0xffffff, this.offen ? 0.55 : 1);
    g.fillRect(f.links, f.oben, BREITE, f.unten - f.oben - 8);
    g.fillStyle(0x3a4252);
    g.fillRect(f.links + 9, f.oben + 2, BREITE - 18, 18);
    g.fillStyle(this.farbe);
    g.fillRect(f.links - 2, BODEN_Y - 8, BREITE + 4, 8);

    // Degen: von der Hand an der Vorderkante bis zur Spitze
    const s = this.spitze;
    const handY = this.geduckt ? f.oben + 25 : BODEN_Y - 65;
    g.lineStyle(3, 0xc8ccd4);
    g.lineBetween(this.vorderkante, handY, s.x, s.y);
  }
}
