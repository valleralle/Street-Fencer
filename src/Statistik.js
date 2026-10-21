// Zählt während eines Gefechts mit, was jeder Fechter gemacht hat – für die Auswertung am Ende.
import { text } from './texte.js';

// flechenPariert, trefferNachFinte und tiefstossTreffer stehen nicht in der Tabelle – sie zählen für die Erfolge
const leer = () => ({ angriffe: 0, finten: 0, treffer: 0, riposten: 0, paraden: 0, doppeltreffer: 0, flechenPariert: 0, trefferNachFinte: 0, tiefstossTreffer: 0 });

export default class Statistik {
  constructor() {
    this.werte = { rot: leer(), gruen: leer() };
  }

  // Ein Angriff wurde ausgeführt (die Klinge ist nach vorn geschnellt)
  angriff(farbe) {
    this.werte[farbe].angriffe++;
  }

  // Ein Angriff wurde während des Ausholens abgebrochen
  finte(farbe) {
    this.werte[farbe].finten++;
  }

  // farbe hat erfolgreich pariert; angriff = was pariert wurde (z. B. 'fleche')
  parade(farbe, angriff) {
    this.werte[farbe].paraden++;
    if (angriff === 'fleche') this.werte[farbe].flechenPariert++;
  }

  // farbe hat getroffen; aktion = womit (z. B. 'riposte'), nachFinte = kurz nach einer Finte.
  // Zählt auch Treffer in Doppeltreffern.
  treffer(farbe, aktion, nachFinte = false) {
    const w = this.werte[farbe];
    w.treffer++;
    if (aktion === 'riposte') w.riposten++;
    if (aktion === 'tiefstoss') w.tiefstossTreffer++;
    if (nachFinte) w.trefferNachFinte++;
  }

  doppeltreffer() {
    this.werte.rot.doppeltreffer++;
    this.werte.gruen.doppeltreffer++;
  }

  // Anteil der Angriffe, die getroffen haben, in Prozent
  trefferquote(farbe) {
    const { angriffe, treffer } = this.werte[farbe];
    return angriffe ? Math.round((100 * treffer) / angriffe) : 0;
  }

  // Zeilen für die Anzeige: [Bezeichnung, Rot, Grün]
  zeilen() {
    const { rot, gruen } = this.werte;
    return [
      ['angriffe', rot.angriffe, gruen.angriffe],
      ['finten', rot.finten, gruen.finten],
      ['treffer', rot.treffer, gruen.treffer],
      ['riposten', rot.riposten, gruen.riposten],
      ['paraden', rot.paraden, gruen.paraden],
      ['doppeltreffer', rot.doppeltreffer, gruen.doppeltreffer],
      ['trefferquote', `${this.trefferquote('rot')} %`, `${this.trefferquote('gruen')} %`],
    ].map(([name, r, g]) => [text(`statistik.${name}`), String(r), String(g)]);
  }
}
