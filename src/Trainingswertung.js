// Wertung im Training (Issue #24): Medaillen je Lektion nach der Zeit bis zum Erfolg und der
// Reaktionstest Parade. Bestleistungen liegen im Browser (localStorage).
import { LEKTIONEN } from './lektionen.js';
import { text } from './texte.js';

export const MEDAILLEN = ['gold', 'silber', 'bronze'];

// Grenzen je Lektion in ms: [Gold bis, Silber bis]; wer langsamer ist, bekommt Bronze.
// Gold = Zeit des Test-Spielers (test/trainingsspieler.js, Reaktionszeit 220 ms) plus 2,5 s zum Lesen
// der Anleitung, aufgerundet auf halbe Sekunden; Silber = dreimal so lang.
export const GRENZEN = {
  bewegen: [3500, 10500], // Test-Spieler 0,9 s
  stoss: [3500, 10500], // 0,9 s
  ausfall: [3000, 9000], // 0,4 s
  parade: [4500, 13500], // 1,5 s
  riposte: [4500, 13500], // 1,6 s
  finte: [3500, 10500], // 0,5 s
  tiefstoss: [5000, 15000], // 2,1 s
  fleche: [3500, 10500], // 0,5 s
};

export const REAKTIONSTEST_ANGRIFFE = 10;

const SCHLUESSEL = 'street-fencer.training';

// Zeit in Sekunden mit einer Nachkommastelle, z. B. „2,3 s“ (Englisch „2.3 s“)
export function sekunden(ms) {
  const zehntel = Math.round(ms / 100);
  return text('training.sekunden', { s: Math.floor(zehntel / 10), z: zehntel % 10 });
}

export function medaille(lektion, zeit) {
  const [gold, silber] = GRENZEN[lektion];
  if (zeit <= gold) return 'gold';
  if (zeit <= silber) return 'silber';
  return 'bronze';
}

const leer = () => ({ lektionen: {}, reaktionstest: null });

// Trägt eine geschaffte Lektion ein; liefert die neuen Daten, die Medaille und ob es eine neue Bestleistung ist
export function trageLektionEin(daten, lektion, zeit) {
  const bisher = daten.lektionen[lektion];
  const bestleistung = bisher === undefined || zeit < bisher;
  const neu = { ...daten, lektionen: { ...daten.lektionen, [lektion]: bestleistung ? zeit : bisher } };
  return { daten: neu, medaille: medaille(lektion, zeit), bestleistung: bestleistung && bisher !== undefined, erstesMal: bisher === undefined };
}

// Beste Medaille einer Lektion (null, solange sie nie geschafft wurde)
export function besteMedaille(daten, lektion) {
  const zeit = daten.lektionen[lektion];
  return zeit === undefined ? null : medaille(lektion, zeit);
}

export const alleGeschafft = (daten) => LEKTIONEN.every((l) => daten.lektionen[l.id] !== undefined);

// versuche = [{ pariert, reaktion }] – reaktion = ms vom Ausholen des Trainers bis zur Parade.
// Liefert die Zahl der Paraden und die mittlere Reaktionszeit der gelungenen (null ohne Parade).
export function werteReaktionstestAus(versuche) {
  const gelungen = versuche.filter((v) => v.pariert);
  const mittel = gelungen.length ? Math.round(gelungen.reduce((s, v) => s + v.reaktion, 0) / gelungen.length) : null;
  return { paraden: gelungen.length, angriffe: versuche.length, mittel };
}

// Besser ist, wer mehr pariert; bei gleich vielen Paraden die kürzere mittlere Reaktionszeit
export function istBesser(ergebnis, bisher) {
  if (!bisher) return ergebnis.paraden > 0;
  if (ergebnis.paraden !== bisher.paraden) return ergebnis.paraden > bisher.paraden;
  return ergebnis.mittel !== null && ergebnis.mittel < bisher.mittel;
}

export function trageReaktionstestEin(daten, ergebnis) {
  const bestleistung = istBesser(ergebnis, daten.reaktionstest);
  return { daten: bestleistung ? { ...daten, reaktionstest: ergebnis } : daten, bestleistung };
}

const zahl = (w) => typeof w === 'number' && Number.isFinite(w) && w >= 0;

// Lädt die Bestleistungen; fehlende oder kaputte Werte werden ignoriert
export function ladeTraining(speicher = globalThis.localStorage) {
  const daten = leer();
  try {
    const gespeichert = JSON.parse(speicher?.getItem(SCHLUESSEL) ?? 'null');
    if (!gespeichert || typeof gespeichert !== 'object') return daten;
    for (const { id } of LEKTIONEN) {
      if (zahl(gespeichert.lektionen?.[id])) daten.lektionen[id] = gespeichert.lektionen[id];
    }
    const r = gespeichert.reaktionstest;
    if (r && Number.isInteger(r.paraden) && Number.isInteger(r.angriffe) && r.paraden <= r.angriffe && (r.mittel === null || zahl(r.mittel))) {
      daten.reaktionstest = { paraden: r.paraden, angriffe: r.angriffe, mittel: r.mittel };
    }
  } catch {
    // Kein Speicher (z. B. privates Fenster) oder kaputte Daten
  }
  return daten;
}

export function speichereTraining(daten, speicher = globalThis.localStorage) {
  try {
    speicher?.setItem(SCHLUESSEL, JSON.stringify(daten));
  } catch {
    // Speichern ist nicht möglich – die Bestleistungen gelten dann nur bis zum Neuladen
  }
}
