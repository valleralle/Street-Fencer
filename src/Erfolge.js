// Erfolge (Issue #23): kleine Ziele, die man in Gefechten gegen den Computer und im Training erreicht.
// Sie werden im Browser gespeichert (localStorage), getrennt von den Einstellungen. Vorerst ohne
// Belohnung – spätere Freischaltungen (#28) fragen sie mit hatErfolg(id) ab.
//
// Gefechtsergebnis (aus der KampfSzene, nur gegen den Computer; der Spieler ist Rot):
//   { art: 'gefecht', stufe, sieg, stand: { rot, gruen }, verlaengerung, letzterTreffer (Aktion des letzten
//     eigenen Treffers), groessterRueckstand, statistik: Statistik.werte.rot }
// Trainingsergebnis: { art: 'training', abgeschlossen }

const SCHLUESSEL = 'street-fencer.erfolge';

// Zähler über alle Gefechte; Name → wie viel ein Gefechtsergebnis dazu beiträgt
const ZAEHLER = {
  gefechte: (e) => (e.art === 'gefecht' ? 1 : 0),
  flechenPariert: (e) => e.statistik?.flechenPariert ?? 0,
  riposten: (e) => e.statistik?.riposten ?? 0,
};

const gefecht = (regel) => (e) => e.art === 'gefecht' && regel(e);
const sieg = (regel = () => true) => gefecht((e) => e.sieg && regel(e));

// id, gruppe und Regel; Erfolge mit zaehler/ziel gelten, sobald der Zähler das Ziel erreicht.
// Name und Beschreibung: text(`erfolg.<id>.titel`) und text(`erfolg.<id>.text`)
export const ERFOLGE = [
  { id: 'ersterTreffer', gruppe: 'ersteSchritte', regel: gefecht((e) => e.stand.rot > 0) },
  { id: 'ersterSieg', gruppe: 'ersteSchritte', regel: sieg() },
  { id: 'training', gruppe: 'ersteSchritte', regel: (e) => e.art === 'training' && e.abgeschlossen },
  { id: 'riposteSieg', gruppe: 'technik', regel: sieg((e) => e.letzterTreffer === 'riposte') },
  { id: 'finteTreffer', gruppe: 'technik', regel: gefecht((e) => e.statistik.trefferNachFinte > 0) },
  { id: 'tiefstossSchwer', gruppe: 'technik', regel: gefecht((e) => e.stufe === 'schwer' && e.statistik.tiefstossTreffer > 0) },
  { id: 'flechen10', gruppe: 'technik', zaehler: 'flechenPariert', ziel: 10 },
  { id: 'riposten25', gruppe: 'technik', zaehler: 'riposten', ziel: 25 },
  { id: 'siegSchwer', gruppe: 'leistung', regel: sieg((e) => e.stufe === 'schwer') },
  { id: 'zuNullSchwer', gruppe: 'leistung', regel: sieg((e) => e.stufe === 'schwer' && e.stand.gruen === 0) },
  { id: 'verlaengerung', gruppe: 'leistung', regel: sieg((e) => e.verlaengerung) },
  { id: 'aufholjagd', gruppe: 'leistung', regel: sieg((e) => e.groessterRueckstand >= 3) },
  { id: 'gefechte10', gruppe: 'ausdauer', zaehler: 'gefechte', ziel: 10 },
  { id: 'gefechte50', gruppe: 'ausdauer', zaehler: 'gefechte', ziel: 50 },
  { id: 'gefechte100', gruppe: 'ausdauer', zaehler: 'gefechte', ziel: 100 },
];
export const GRUPPEN = ['ersteSchritte', 'technik', 'leistung', 'ausdauer'];

const leer = () => ({ erreicht: {}, zaehler: Object.fromEntries(Object.keys(ZAEHLER).map((z) => [z, 0])) });

// Zählt das Ergebnis mit und schaltet neue Erfolge frei. Liefert die neuen Daten und die ids der
// neu erreichten Erfolge (in der Reihenfolge von ERFOLGE). datum = Zeitpunkt der Freischaltung.
export function pruefe(daten, ergebnis, datum = Date.now()) {
  const neu = { erreicht: { ...daten.erreicht }, zaehler: { ...daten.zaehler } };
  for (const [name, beitrag] of Object.entries(ZAEHLER)) neu.zaehler[name] = (neu.zaehler[name] ?? 0) + beitrag(ergebnis);
  const freigeschaltet = [];
  for (const erfolg of ERFOLGE) {
    if (neu.erreicht[erfolg.id]) continue;
    const geschafft = erfolg.zaehler ? neu.zaehler[erfolg.zaehler] >= erfolg.ziel : erfolg.regel(ergebnis);
    if (geschafft) {
      neu.erreicht[erfolg.id] = datum;
      freigeschaltet.push(erfolg.id);
    }
  }
  return { daten: neu, neu: freigeschaltet };
}

// Stand eines Zähler-Erfolgs, z. B. { stand: 37, ziel: 50 }; null bei Erfolgen ohne Zähler
export function fortschritt(daten, id) {
  const erfolg = ERFOLGE.find((e) => e.id === id);
  if (!erfolg?.zaehler) return null;
  return { stand: Math.min(daten.zaehler[erfolg.zaehler] ?? 0, erfolg.ziel), ziel: erfolg.ziel };
}

export function hatErfolg(id, daten = ladeErfolge()) {
  return Boolean(daten.erreicht[id]);
}

// Lädt die Erfolge; fehlende oder kaputte Werte werden ignoriert
export function ladeErfolge(speicher = globalThis.localStorage) {
  const daten = leer();
  try {
    const gespeichert = JSON.parse(speicher?.getItem(SCHLUESSEL) ?? 'null');
    if (!gespeichert || typeof gespeichert !== 'object') return daten;
    for (const { id } of ERFOLGE) {
      const datum = gespeichert.erreicht?.[id];
      if (typeof datum === 'number' && Number.isFinite(datum)) daten.erreicht[id] = datum;
    }
    for (const name of Object.keys(ZAEHLER)) {
      const wert = gespeichert.zaehler?.[name];
      if (Number.isInteger(wert) && wert >= 0) daten.zaehler[name] = wert;
    }
  } catch {
    // Kein Speicher (z. B. privates Fenster) oder kaputte Daten
  }
  return daten;
}

export function speichereErfolge(daten, speicher = globalThis.localStorage) {
  try {
    speicher?.setItem(SCHLUESSEL, JSON.stringify(daten));
  } catch {
    // Speichern ist nicht möglich – die Erfolge gelten dann nur bis zum Neuladen
  }
}
