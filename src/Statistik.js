// Zählt während eines Gefechts mit, was jeder Fechter gemacht hat – für die Auswertung am Ende.
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
      ['Angriffe', rot.angriffe, gruen.angriffe],
      ['Finten', rot.finten, gruen.finten],
      ['Treffer', rot.treffer, gruen.treffer],
      ['davon Riposten', rot.riposten, gruen.riposten],
      ['Paraden', rot.paraden, gruen.paraden],
      ['Doppeltreffer', rot.doppeltreffer, gruen.doppeltreffer],
      ['Trefferquote', `${this.trefferquote('rot')} %`, `${this.trefferquote('gruen')} %`],
    ].map(([name, r, g]) => [name, String(r), String(g)]);
  }
}
