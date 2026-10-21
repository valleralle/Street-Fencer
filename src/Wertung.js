// Wertungszahl nach Art der Elo-Zahl für Gefechte gegen den Computer (Issue #26).
// Jede Computerstufe hat eine feste Wertung; nach jedem Gefecht ändert sich die Zahl des Spielers
// um K × (Ergebnis − Erwartung). Der Verlauf der letzten Gefechte liegt im Browser (localStorage).

export const START = 1000;
export const K = 32;
export const STUFEN_WERTUNG = { leicht: 900, mittel: 1200, schwer: 1500 };
export const VERLAUF_LAENGE = 100;

// Ränge ab dieser Wertung (aufsteigend); Namen über text(`rang.${rang}`)
export const RAENGE = [
  ['anfaenger', -Infinity],
  ['vereinsfechter', 1050],
  ['landesklasse', 1200],
  ['bundesklasse', 1350],
  ['meister', 1500],
];

const SCHLUESSEL = 'street-fencer.wertung';

// Wie wahrscheinlich ein Fechter mit Wertung `eigene` gegen einen mit `gegner` gewinnt (0 bis 1)
export function erwartung(eigene, gegner) {
  return 1 / (1 + 10 ** ((gegner - eigene) / 400));
}

// Wertung nach einem Gefecht gegen einen Gegner mit Wertung `gegner`
export function neueWertung(alt, gegner, gewonnen) {
  return Math.round(alt + K * ((gewonnen ? 1 : 0) - erwartung(alt, gegner)));
}

export function rang(wertung) {
  return RAENGE.findLast(([, ab]) => wertung >= ab)[0];
}

// Aktuelle Wertung: die nach dem letzten Gefecht, sonst der Start
export const aktuelleWertung = (verlauf) => verlauf.at(-1)?.wertung ?? START;

// Trägt ein Gefecht gegen den Computer ein. gefecht = { stufe, sieg, treffer, gegentreffer, datum }.
// Liefert den neuen Verlauf (höchstens VERLAUF_LAENGE Gefechte) und was sich geändert hat.
export function trageEin(verlauf, { stufe, sieg, treffer, gegentreffer, datum = Date.now() }) {
  const alt = aktuelleWertung(verlauf);
  const neu = neueWertung(alt, STUFEN_WERTUNG[stufe], sieg);
  const neuerVerlauf = [...verlauf, { datum, stufe, sieg, treffer, gegentreffer, wertung: neu }].slice(-VERLAUF_LAENGE);
  return { verlauf: neuerVerlauf, alt, neu, aenderung: neu - alt, rangVorher: rang(alt), rangJetzt: rang(neu) };
}

// Steigt der Rang, liefert das den neuen Rang (sonst null)
export function aufstieg({ rangVorher, rangJetzt }) {
  const stufe = (r) => RAENGE.findIndex(([name]) => name === r);
  return stufe(rangJetzt) > stufe(rangVorher) ? rangJetzt : null;
}

// Siegquote und Trefferquote (Anteil der eigenen an allen Treffern) der letzten n Gefechte, in Prozent
export function quoten(verlauf, n = 20) {
  const letzte = verlauf.slice(-n);
  if (!letzte.length) return { gefechte: 0, siegquote: 0, trefferquote: 0 };
  const siege = letzte.filter((g) => g.sieg).length;
  const treffer = letzte.reduce((s, g) => s + g.treffer, 0);
  const alle = treffer + letzte.reduce((s, g) => s + g.gegentreffer, 0);
  return {
    gefechte: letzte.length,
    siegquote: Math.round((100 * siege) / letzte.length),
    trefferquote: alle ? Math.round((100 * treffer) / alle) : 0,
  };
}

const zahl = (w) => typeof w === 'number' && Number.isFinite(w);
const gueltig = (g) =>
  g && zahl(g.datum) && g.stufe in STUFEN_WERTUNG && typeof g.sieg === 'boolean' && zahl(g.treffer) && zahl(g.gegentreffer) && zahl(g.wertung);

// Lädt den Verlauf; kaputte Einträge fallen weg, kaputte Daten ergeben einen leeren Verlauf
export function ladeVerlauf(speicher = globalThis.localStorage) {
  try {
    const gespeichert = JSON.parse(speicher?.getItem(SCHLUESSEL) ?? 'null');
    if (!Array.isArray(gespeichert)) return [];
    return gespeichert.filter(gueltig).slice(-VERLAUF_LAENGE);
  } catch {
    // Kein Speicher (z. B. privates Fenster) oder kaputte Daten
    return [];
  }
}

export function speichereVerlauf(verlauf, speicher = globalThis.localStorage) {
  try {
    speicher?.setItem(SCHLUESSEL, JSON.stringify(verlauf));
  } catch {
    // Speichern ist nicht möglich – die Wertung gilt dann nur bis zum Neuladen
  }
}
