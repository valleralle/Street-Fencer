// Steuert einen Fechter vom Spiel aus. Er sieht nur, was auch ein Spieler sieht – die Aktion
// des Gegners und den Abstand – und reagiert darauf erst nach seiner Reaktionszeit.
//   reaktion        – Millisekunden, bis er auf eine Aktion des Gegners antwortet
//   treffsicherheit – wie oft er die richtige Antwort wählt (0 bis 1)
//   angriffslust    – wie oft er von sich aus angreift (0 bis 1)
//   durchschaut     – wie oft er mit der Parade wartet, bis der Stoß wirklich kommt (fällt dann auf keine Finte herein)
//   finten          – wie oft er einen eigenen Stoß erst antäuscht
//   taktik          – wie oft er seine Spielweise nach Spielstand und Restzeit wählt statt nach Laune,
//                     und wie oft er in Führung auf Doppeltreffer spielt (0 bis 1)
//   bedenkzeit      – Millisekunden, bis er seine Spielweise wieder überdenkt
export const STUFEN = {
  leicht: { reaktion: 400, treffsicherheit: 0.45, angriffslust: 0.3, durchschaut: 0, finten: 0, taktik: 0.15, bedenkzeit: 6000 },
  mittel: { reaktion: 260, treffsicherheit: 0.65, angriffslust: 0.5, durchschaut: 0.4, finten: 0.15, taktik: 0.55, bedenkzeit: 3500 },
  schwer: { reaktion: 145, treffsicherheit: 0.93, angriffslust: 0.7, durchschaut: 0.8, finten: 0.3, taktik: 0.95, bedenkzeit: 2000 },
};

// Spielweisen (Issue #13): angreifen – wie bisher von sich aus angreifen; abwarten – knapp außerhalb
// der Reichweite bleiben und auf den Angriff des Gegners antworten (Parade, Riposte, Tiefstoß);
// distanz – weiter weg bleiben, zurückweichen und nur Gelegenheiten nutzen.
// abstand = Bereich des Wunschabstands, angriffe = Anteil seiner Angriffslust in dieser Spielweise
// gleichzeitig – nur in Führung: nah dranbleiben und in den Angriff des Gegners hinein angreifen,
// damit beide treffen (Doppeltreffer: Vorsprung bleibt, das Ende rückt näher).
const SPIELWEISEN = {
  angreifen: { abstand: [135, 205], angriffe: 1 },
  abwarten: { abstand: [215, 245], angriffe: 0.1 },
  distanz: { abstand: [250, 300], angriffe: 0 },
  gleichzeitig: { abstand: [135, 160], angriffe: 0.3 },
};

// Charakter des Computers für ein Gefecht: Vorliebe für die Spielweisen (Gewichte) und Geduld –
// so lange wartet er in einer abwartenden Spielweise auf einen Angriff, dann greift er selbst an
export const CHARAKTERE = {
  angreifer: { name: 'Angreifer', gewichte: { angreifen: 4, abwarten: 1, distanz: 1 }, geduld: 2500 },
  konterfechter: { name: 'Konterfechter', gewichte: { angreifen: 1, abwarten: 4, distanz: 1 }, geduld: 8000 },
  taktiker: { name: 'Taktiker', gewichte: { angreifen: 1.5, abwarten: 1.5, distanz: 2 }, geduld: 5000 },
};
const ENDSPURT = 30_000; // so viel Restzeit gilt als „wenig“

// Abstände zwischen den beiden Fechtern (Mitte zu Mitte), aus denen eine Aktion trifft
const STOSS_REICHWEITE = 125;
const AUSFALL_REICHWEITE = 200;
const TIEFSTOSS_REICHWEITE = 115;
const FLECHE_REICHWEITE = 265;
const FLECHE_TREFFABSTAND = 130; // ab diesem Abstand trifft die Klinge der Flèche

import { AKTIONEN, FINTEN } from './Fechter.js';
import { ENDLINIE_LINKS, ENDLINIE_RECHTS } from './kulisse.js';

const AN_DER_WAND = 140; // so nah an der eigenen Endlinie hört das Abwarten auf

const DENKPAUSE = 200; // so oft überlegt er, ob er selbst angreift
const ANGRIFFE = ['stoss', 'ausfall', 'riposte', 'fleche'];
const REICHWEITEN = { stoss: STOSS_REICHWEITE, riposte: STOSS_REICHWEITE, ausfall: AUSFALL_REICHWEITE, fleche: FLECHE_REICHWEITE };

export default class Computergegner {
  // charakter = Schlüssel aus CHARAKTERE; ohne Angabe zufällig
  constructor(stufe, zufall = Math.random, charakter = null) {
    this.werte = STUFEN[stufe];
    this.zufall = zufall;
    const namen = Object.keys(CHARAKTERE);
    this.charakter = charakter ?? namen[Math.floor(zufall() * namen.length)];
    this.spielweise = 'angreifen';
    this.naechsteWahl = 0;
    this.letzterAngriffGegner = 0;
    this.gefecht = null;
    this.farbe = 'gruen';
    this.halte = { links: false, rechts: false };
    this.gedrueckteTasten = new Set();
    this.geplant = [];
    this.wunschAbstand = 170;
    this.naechsterGedanke = 0;
    this.naechsterAbstandswechsel = 0;
    this.gesehen = null;
    this.ausgenutzt = null;
    this.flecheAbwehr = null;
  }

  // Schnittstelle einer Steuerung (siehe steuerung.js)
  gehalten(name) {
    return this.halte[name];
  }

  gedrueckt(name) {
    return this.gedrueckteTasten.delete(name);
  }

  // Was auf der Anzeige steht: Spielstand, Restzeit, Verlängerung (siehe Gefecht). farbe = seine Farbe.
  kenneGefecht(gefecht, farbe = 'gruen') {
    this.gefecht = gefecht;
    this.farbe = farbe;
  }

  get charakterName() {
    return CHARAKTERE[this.charakter].name;
  }

  // Wie viele Treffer er vorne liegt (negativ: hinten); ohne Gefecht 0
  get vorsprung() {
    if (!this.gefecht) return 0;
    const gegner = this.farbe === 'gruen' ? 'rot' : 'gruen';
    return this.gefecht.stand[this.farbe] - this.gefecht.stand[gegner];
  }

  // In Führung bewusst auf Doppeltreffer spielen: Beide bekommen einen Punkt, der Vorsprung bleibt und
  // das Ende rückt näher. Nicht, wenn ein Doppeltreffer gestrichen würde (4:4, Verlängerung).
  get spieltAufDoppeltreffer() {
    return this.vorsprung > 0 && !this.gefecht.entscheidend;
  }

  // Wählt die Spielweise: mit der Wahrscheinlichkeit taktik nach Stand und Restzeit, sonst nach Charakter
  waehleSpielweise() {
    const gewichte = { ...CHARAKTERE[this.charakter].gewichte, gleichzeitig: 0 };
    // Wer wenig taktisch ficht (Leicht), greift eher planlos an – abwarten lohnt sich mit langsamer Reaktion nicht
    gewichte.angreifen += 15 * (1 - this.werte.taktik) ** 2;
    if (this.gefecht && this.zufall() < this.werte.taktik) {
      const knapp = this.gefecht.restzeit < ENDSPURT && !this.gefecht.verlaengerung;
      if (this.vorsprung > 0) {
        gewichte.abwarten *= 2.5;
        gewichte.distanz *= knapp ? 6 : 2; // vorne und wenig Zeit: auf Zeit spielen
        gewichte.angreifen *= 0.5;
        if (this.spieltAufDoppeltreffer) gewichte.gleichzeitig = knapp ? 3 : 6;
      } else if (this.vorsprung < 0) {
        gewichte.angreifen *= knapp ? 8 : 3;
        gewichte.abwarten *= 0.5;
        gewichte.distanz *= 0.3;
      }
    }
    let wurf = this.zufall() * Object.values(gewichte).reduce((a, b) => a + b, 0);
    for (const [weise, gewicht] of Object.entries(gewichte)) {
      wurf -= gewicht;
      if (wurf <= 0) return weise;
    }
    return 'angreifen';
  }

  // Vor jedem Bild aufrufen: ich = sein Fechter, gegner = der andere
  denke(jetzt, ich, gegner) {
    const vor = ich.richtung > 0 ? 'rechts' : 'links';
    const zurueck = ich.richtung > 0 ? 'links' : 'rechts';
    const abstand = Math.abs(gegner.x - ich.x);
    const { reaktion, treffsicherheit, angriffslust } = this.werte;

    // Auf jede neue Aktion des Gegners einmal reagieren
    const aktion = gegner.aktion ? `${gegner.aktion}@${gegner.aktionStart}` : null;
    if (aktion && aktion !== this.gesehen) this.reagiere(jetzt, gegner, abstand);
    this.gesehen = aktion;

    // Spielweise von Zeit zu Zeit überdenken, und sofort, wenn sich der Stand ändert.
    // Wartet er vergeblich, verliert er die Geduld und greift an.
    if (gegner.aktion) this.letzterAngriffGegner = jetzt;
    const stand = this.gefecht ? `${this.gefecht.stand.rot}:${this.gefecht.stand.gruen}:${this.gefecht.verlaengerung}` : '';
    if (stand !== this.letzterStand || (this.spielweise === 'gleichzeitig' && !this.spieltAufDoppeltreffer)) {
      this.letzterStand = stand;
      this.naechsteWahl = jetzt;
    }
    if (jetzt >= this.naechsteWahl) {
      this.spielweise = this.waehleSpielweise();
      this.naechsteWahl = jetzt + this.werte.bedenkzeit * (0.7 + this.zufall() * 0.6);
      this.naechsterAbstandswechsel = jetzt;
    } else if (
      ['abwarten', 'distanz'].includes(this.spielweise) &&
      jetzt - Math.max(this.letzterAngriffGegner, this.naechsteWahl - this.werte.bedenkzeit) > CHARAKTERE[this.charakter].geduld
    ) {
      this.spielweise = 'angreifen';
      this.naechsterAbstandswechsel = jetzt;
    }
    // An der eigenen Endlinie gibt es nichts mehr abzuwarten – dann greift er an
    const bisEndlinie = ich.richtung > 0 ? ich.x - ENDLINIE_LINKS : ENDLINIE_RECHTS - ich.x;
    if (['abwarten', 'distanz'].includes(this.spielweise) && bisEndlinie < AN_DER_WAND) this.spielweise = 'angreifen';
    const weise = SPIELWEISEN[this.spielweise];

    // Läuft eine Flèche auf ihn zu, greift er nicht selbst an und geht ihr nicht entgegen –
    // mitten im eigenen Angriff könnte er nicht parieren
    const flecheKommt = gegner.aktion === 'fleche' && gegner.phase !== 'erholung';
    this.wehreFlecheAb(jetzt, gegner, abstand);

    // Nach einer gelungenen Parade ripostieren
    if (ich.kannRiposte && this.ausgenutzt !== `riposte@${ich.riposteBis}`) {
      this.ausgenutzt = `riposte@${ich.riposteBis}`;
      if (this.zufall() < treffsicherheit) this.plane(jetzt + reaktion / 2, 'stoss');
    }

    // Ist der Gegner offen oder erholt er sich gerade, ist das die Gelegenheit
    const verwundbar = gegner.offen || gegner.phase === 'erholung';
    const gelegenheit = gegner.offen ? `offen@${gegner.offenBis}` : `erholung@${gegner.aktionStart}`;
    if (verwundbar && !flecheKommt && abstand <= AUSFALL_REICHWEITE && this.ausgenutzt !== gelegenheit) {
      this.ausgenutzt = gelegenheit;
      if (this.zufall() < treffsicherheit) {
        this.plane(jetzt + reaktion, 'stoss', abstand > STOSS_REICHWEITE);
      }
    }

    // Auf Doppeltreffer spielen: kommt der Gegner heran, in seine Vorbereitung hinein angreifen –
    // dann landen beide Stöße etwa gleichzeitig
    const kommtHeran = gegner.geht && abstand < (this.letzterAbstand ?? abstand);
    this.letzterAbstand = abstand;
    if (
      this.spielweise === 'gleichzeitig' &&
      kommtHeran &&
      !ich.aktion &&
      !flecheKommt &&
      !this.geplant.length &&
      abstand <= STOSS_REICHWEITE + 15
    ) {
      this.plane(jetzt, 'stoss');
    }

    // Von sich aus angreifen
    if (jetzt >= this.naechsterGedanke) {
      this.naechsterGedanke = jetzt + DENKPAUSE;
      if (!ich.aktion && !flecheKommt && this.zufall() < angriffslust * 0.4 * weise.angriffe) {
        if (abstand <= TIEFSTOSS_REICHWEITE && this.zufall() < 0.2) this.plane(jetzt, 'tiefstoss');
        else if (abstand <= STOSS_REICHWEITE && this.zufall() < this.werte.finten) {
          // Finte: ausholen, abbrechen, dann wirklich zustoßen
          this.plane(jetzt, 'stoss');
          this.plane(jetzt + 180, 'stoss', false, { finte: true });
          this.plane(jetzt + 230, 'stoss');
        } else if (abstand <= STOSS_REICHWEITE) this.plane(jetzt, 'stoss');
        else if (abstand <= AUSFALL_REICHWEITE) this.plane(jetzt, 'stoss', true);
        // Die Flèche ist riskant – nur selten und nur aus mittlerer Distanz
        else if (abstand <= FLECHE_REICHWEITE - 20 && this.zufall() < 0.25) this.plane(jetzt, 'fleche');
      }
    }

    // Abstand halten: knapp außerhalb der Reichweite des Gegners, mit wechselndem Rhythmus
    if (jetzt >= this.naechsterAbstandswechsel) {
      const [nah, fern] = weise.abstand;
      this.wunschAbstand = nah + this.zufall() * (fern - nah);
      this.naechsterAbstandswechsel = jetzt + 600 + this.zufall() * 1000;
    }
    this.halte[vor] = !ich.aktion && !flecheKommt && abstand > this.wunschAbstand + 8;
    this.halte[zurueck] = !ich.aktion && abstand < this.wunschAbstand - 8;
    // Hat er die Flèche bemerkt, aber keine Abwehr geplant, weicht er wenigstens aus – oft läuft sie dann ins Leere
    if (flecheKommt && !this.flecheAbwehr && !ich.aktion && jetzt >= gegner.aktionStart + reaktion) {
      this.halte[vor] = false;
      this.halte[zurueck] = true;
    }

    // Fällige Tastendrücke ausführen; beim Ausfall wird dazu vorwärts gehalten
    for (const p of this.geplant.filter((p) => p.zeit <= jetzt)) {
      if (p.bedingung && !p.bedingung()) continue;
      // Ein zweiter Stoß-Druck während des Ausholens wäre eine Finte – nur, wenn sie gewollt ist
      if (p.taste === 'stoss' && !p.finte && FINTEN.includes(ich.aktion) && ich.phase === 'anlauf') continue;
      if (p.vorwaerts) {
        this.halte[vor] = true;
        this.halte[zurueck] = false;
      }
      this.gedrueckteTasten.add(p.taste);
    }
    this.geplant = this.geplant.filter((p) => p.zeit > jetzt);
  }

  reagiere(jetzt, gegner, abstand) {
    const { reaktion, treffsicherheit, durchschaut } = this.werte;
    const aktion = gegner.aktion;
    const zeit = jetzt + reaktion;
    const richtig = this.zufall() < treffsicherheit;

    if (ANGRIFFE.includes(aktion)) {
      if (abstand > REICHWEITEN[aktion] + 10) return;
      // Auf Doppeltreffer aus: Gegenangriff statt Parade (außer gegen die Flèche, die zu schnell ist)
      if (this.spielweise === 'gleichzeitig' && aktion !== 'fleche' && abstand <= STOSS_REICHWEITE + 30) {
        this.plane(zeit, 'stoss');
        return;
      }
      // Richtig: Parade oder unter dem Stoß wegtauchen. Falsch: selbst stoßen (Doppeltreffer) oder nichts tun –
      // im Rückstand bringt ein Doppeltreffer nichts, dann stößt er nicht blind zurück
      const blindZurueck = !(this.vorsprung < 0 && this.zufall() < this.werte.taktik);
      const antwort = this.zufall() < 0.7 ? 'parade' : 'tiefstoss';
      if (aktion === 'fleche') {
        // Die Flèche kommt erst nach Antritt und Sprint an – wann genau, rechnet wehreFlecheAb laufend nach.
        // Falsch eingeschätzt: aus der Nähe ein Gegenstoß wie bei jedem Angriff, aus der Distanz
        // weicht er nur aus (siehe denke) – ein Stoß würde dort ins Leere gehen
        if (richtig) this.flecheAbwehr = { start: gegner.aktionStart, antwort, fruehestens: zeit };
        else if (abstand <= STOSS_REICHWEITE + 30 && this.zufall() < 0.5) this.plane(zeit, 'stoss');
      } else if (richtig && FINTEN.includes(aktion) && this.zufall() < durchschaut) {
        // Durchschaut: erst kurz bevor die Klinge ankommt antworten – und nur, wenn der Angriff noch läuft.
        // Der Tiefstoß braucht etwas mehr Vorlauf, weil man erst abtauchen muss.
        const start = gegner.aktionStart;
        const vorlauf = antwort === 'tiefstoss' ? 90 : 30;
        const spaet = Math.max(zeit, start + AKTIONEN[aktion].anlauf - vorlauf);
        this.plane(spaet, antwort, false, { bedingung: () => gegner.aktion === aktion && gegner.aktionStart === start });
      } else if (richtig) this.plane(zeit, antwort);
      else if (blindZurueck && this.zufall() < 0.5) this.plane(zeit, 'stoss');
    } else if (aktion === 'tiefstoss') {
      if (abstand > STOSS_REICHWEITE + 10) return;
      // Richtig: in den Geduckten hineinstoßen. Falsch: eine Parade, die ins Leere geht.
      this.plane(zeit, richtig ? 'stoss' : 'parade');
    }
  }

  // Antwortet kurz bevor die Flèche ankommt. Die Ankunft wird in jedem Bild aus dem aktuellen Abstand
  // neu geschätzt – kommt er ihr entgegen oder läuft sie schneller heran, ist sie früher da (Issue #10)
  wehreFlecheAb(jetzt, gegner, abstand) {
    const abwehr = this.flecheAbwehr;
    if (!abwehr) return;
    if (gegner.aktion !== 'fleche' || gegner.aktionStart !== abwehr.start || gegner.phase === 'erholung') {
      this.flecheAbwehr = null;
      return;
    }
    const f = AKTIONEN.fleche;
    const antrittBis = Math.max(0, abwehr.start + f.anlauf - jetzt);
    const ankunft = jetzt + antrittBis + (Math.max(0, abstand - FLECHE_TREFFABSTAND) / f.tempo) * 1000;
    const vorlauf = abwehr.antwort === 'tiefstoss' ? 120 : 80;
    if (jetzt >= abwehr.fruehestens && ankunft - jetzt <= vorlauf) {
      this.gedrueckteTasten.add(abwehr.antwort);
      this.flecheAbwehr = null;
    }
  }

  // extra.finte = bewusster zweiter Stoß-Druck; extra.bedingung = nur ausführen, wenn sie dann noch gilt
  plane(zeit, taste, vorwaerts = false, extra = {}) {
    this.geplant.push({ zeit, taste, vorwaerts, ...extra });
  }
}
