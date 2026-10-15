// Steuert einen Fechter vom Spiel aus. Er sieht nur, was auch ein Spieler sieht – die Aktion
// des Gegners und den Abstand – und reagiert darauf erst nach seiner Reaktionszeit.
//   reaktion        – Millisekunden, bis er auf eine Aktion des Gegners antwortet
//   treffsicherheit – wie oft er die richtige Antwort wählt (0 bis 1)
//   angriffslust    – wie oft er von sich aus angreift (0 bis 1)
export const STUFEN = {
  leicht: { reaktion: 320, treffsicherheit: 0.45, angriffslust: 0.3 },
  mittel: { reaktion: 150, treffsicherheit: 0.65, angriffslust: 0.5 },
  schwer: { reaktion: 60, treffsicherheit: 0.85, angriffslust: 0.7 },
};

// Abstände zwischen den beiden Fechtern (Mitte zu Mitte), aus denen eine Aktion trifft
const STOSS_REICHWEITE = 125;
const AUSFALL_REICHWEITE = 200;
const TIEFSTOSS_REICHWEITE = 115;

const DENKPAUSE = 200; // so oft überlegt er, ob er selbst angreift
const ANGRIFFE = ['stoss', 'ausfall', 'riposte'];

export default class Computergegner {
  constructor(stufe, zufall = Math.random) {
    this.werte = STUFEN[stufe];
    this.zufall = zufall;
    this.halte = { links: false, rechts: false };
    this.gedrueckteTasten = new Set();
    this.geplant = [];
    this.wunschAbstand = 170;
    this.naechsterGedanke = 0;
    this.naechsterAbstandswechsel = 0;
    this.gesehen = null;
    this.ausgenutzt = null;
  }

  // Schnittstelle einer Steuerung (siehe steuerung.js)
  gehalten(name) {
    return this.halte[name];
  }

  gedrueckt(name) {
    return this.gedrueckteTasten.delete(name);
  }

  // Vor jedem Bild aufrufen: ich = sein Fechter, gegner = der andere
  denke(jetzt, ich, gegner) {
    const vor = ich.richtung > 0 ? 'rechts' : 'links';
    const zurueck = ich.richtung > 0 ? 'links' : 'rechts';
    const abstand = Math.abs(gegner.x - ich.x);
    const { reaktion, treffsicherheit, angriffslust } = this.werte;

    // Auf jede neue Aktion des Gegners einmal reagieren
    const aktion = gegner.aktion ? `${gegner.aktion}@${gegner.aktionStart}` : null;
    if (aktion && aktion !== this.gesehen) this.reagiere(jetzt, gegner.aktion, abstand);
    this.gesehen = aktion;

    // Nach einer gelungenen Parade ripostieren
    if (ich.kannRiposte && this.ausgenutzt !== `riposte@${ich.riposteBis}`) {
      this.ausgenutzt = `riposte@${ich.riposteBis}`;
      if (this.zufall() < treffsicherheit) this.plane(jetzt + reaktion / 2, 'stoss');
    }

    // Ist der Gegner offen oder erholt er sich gerade, ist das die Gelegenheit
    const verwundbar = gegner.offen || gegner.phase === 'erholung';
    const gelegenheit = gegner.offen ? `offen@${gegner.offenBis}` : `erholung@${gegner.aktionStart}`;
    if (verwundbar && abstand <= AUSFALL_REICHWEITE && this.ausgenutzt !== gelegenheit) {
      this.ausgenutzt = gelegenheit;
      if (this.zufall() < treffsicherheit) {
        this.plane(jetzt + reaktion, 'stoss', abstand > STOSS_REICHWEITE);
      }
    }

    // Von sich aus angreifen
    if (jetzt >= this.naechsterGedanke) {
      this.naechsterGedanke = jetzt + DENKPAUSE;
      if (!ich.aktion && this.zufall() < angriffslust * 0.4) {
        if (abstand <= TIEFSTOSS_REICHWEITE && this.zufall() < 0.2) this.plane(jetzt, 'tiefstoss');
        else if (abstand <= STOSS_REICHWEITE) this.plane(jetzt, 'stoss');
        else if (abstand <= AUSFALL_REICHWEITE) this.plane(jetzt, 'stoss', true);
      }
    }

    // Abstand halten: knapp außerhalb der Reichweite des Gegners, mit wechselndem Rhythmus
    if (jetzt >= this.naechsterAbstandswechsel) {
      this.wunschAbstand = 135 + this.zufall() * 70;
      this.naechsterAbstandswechsel = jetzt + 600 + this.zufall() * 1000;
    }
    this.halte[vor] = !ich.aktion && abstand > this.wunschAbstand + 8;
    this.halte[zurueck] = !ich.aktion && abstand < this.wunschAbstand - 8;

    // Fällige Tastendrücke ausführen; beim Ausfall wird dazu vorwärts gehalten
    for (const p of this.geplant.filter((p) => p.zeit <= jetzt)) {
      if (p.vorwaerts) {
        this.halte[vor] = true;
        this.halte[zurueck] = false;
      }
      this.gedrueckteTasten.add(p.taste);
    }
    this.geplant = this.geplant.filter((p) => p.zeit > jetzt);
  }

  reagiere(jetzt, aktion, abstand) {
    const { reaktion, treffsicherheit } = this.werte;
    const zeit = jetzt + reaktion;
    const richtig = this.zufall() < treffsicherheit;

    if (ANGRIFFE.includes(aktion)) {
      const reichweite = aktion === 'ausfall' ? AUSFALL_REICHWEITE : STOSS_REICHWEITE;
      if (abstand > reichweite + 10) return;
      // Richtig: Parade oder unter dem Stoß wegtauchen. Falsch: selbst stoßen (Doppeltreffer) oder nichts tun.
      if (richtig) this.plane(zeit, this.zufall() < 0.7 ? 'parade' : 'tiefstoss');
      else if (this.zufall() < 0.5) this.plane(zeit, 'stoss');
    } else if (aktion === 'tiefstoss') {
      if (abstand > STOSS_REICHWEITE + 10) return;
      // Richtig: in den Geduckten hineinstoßen. Falsch: eine Parade, die ins Leere geht.
      this.plane(zeit, richtig ? 'stoss' : 'parade');
    }
  }

  plane(zeit, taste, vorwaerts = false) {
    this.geplant.push({ zeit, taste, vorwaerts });
  }
}
