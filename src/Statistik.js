// Zählt während eines Gefechts mit, was jeder Fechter gemacht hat – für die Auswertung am Ende.
import { text } from './texte.js';

const leer = () => ({ angriffe: 0, finten: 0, treffer: 0, riposten: 0, paraden: 0, doppeltreffer: 0 });

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

  // farbe hat erfolgreich pariert
  parade(farbe) {
    this.werte[farbe].paraden++;
  }

  // farbe hat getroffen; aktion = womit (z. B. 'riposte'). Zählt auch Treffer in Doppeltreffern.
  treffer(farbe, aktion) {
    this.werte[farbe].treffer++;
    if (aktion === 'riposte') this.werte[farbe].riposten++;
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
