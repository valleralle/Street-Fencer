// Issue #23: Erfolge
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ERFOLGE, GRUPPEN, pruefe, fortschritt, hatErfolg, ladeErfolge, speichereErfolge } from '../src/Erfolge.js';
import { text } from '../src/texte.js';

const leer = () => ladeErfolge(null);
const statistik = (werte = {}) => ({ angriffe: 5, finten: 0, treffer: 0, riposten: 0, paraden: 0, doppeltreffer: 0, flechenPariert: 0, trefferNachFinte: 0, tiefstossTreffer: 0, ...werte });
// Ein verlorenes Gefecht ohne eigene Treffer gegen Mittel; einzelne Werte lassen sich überschreiben
const gefecht = (werte = {}) => ({
  art: 'gefecht',
  stufe: 'mittel',
  sieg: false,
  stand: { rot: 0, gruen: 5 },
  verlaengerung: false,
  letzterTreffer: null,
  groessterRueckstand: 5,
  ...werte,
  statistik: statistik(werte.statistik),
});
const sieg = (werte = {}) => gefecht({ sieg: true, stand: { rot: 5, gruen: 2 }, letzterTreffer: 'stoss', groessterRueckstand: 0, ...werte });
const neu = (ergebnis, daten = leer()) => pruefe(daten, ergebnis).neu;

test('es gibt mindestens 12 Erfolge in den vier Gruppen, mit Texten auf Deutsch und Englisch', () => {
  assert.ok(ERFOLGE.length >= 12);
  assert.equal(new Set(ERFOLGE.map((e) => e.id)).size, ERFOLGE.length);
  for (const e of ERFOLGE) {
    assert.ok(GRUPPEN.includes(e.gruppe), e.id);
    for (const sprache of ['de', 'en']) {
      for (const teil of ['titel', 'text']) assert.notEqual(text(`erfolg.${e.id}.${teil}`, {}, sprache), `erfolg.${e.id}.${teil}`);
    }
  }
  for (const g of GRUPPEN) assert.notEqual(text(`erfolge.gruppe.${g}`), `erfolge.gruppe.${g}`);
});

test('ein verlorenes Gefecht ohne Treffer schaltet nichts frei', () => {
  assert.deepEqual(neu(gefecht()), []);
});

test('ersterTreffer: ein Treffer gegen den Computer', () => {
  assert.ok(neu(gefecht({ stand: { rot: 1, gruen: 5 } })).includes('ersterTreffer'));
});

test('ersterSieg: ein gewonnenes Gefecht', () => {
  assert.ok(neu(sieg()).includes('ersterSieg'));
});

test('training: alle Lektionen geschafft', () => {
  assert.deepEqual(neu({ art: 'training', abgeschlossen: true }), ['training']);
  assert.deepEqual(neu({ art: 'training', abgeschlossen: false }), []);
});

test('riposteSieg: gewonnen mit einer Riposte als letztem Treffer', () => {
  assert.ok(neu(sieg({ letzterTreffer: 'riposte' })).includes('riposteSieg'));
  assert.ok(!neu(sieg({ letzterTreffer: 'stoss' })).includes('riposteSieg'));
  assert.ok(!neu(gefecht({ letzterTreffer: 'riposte' })).includes('riposteSieg'));
});

test('finteTreffer: ein Treffer kurz nach einer Finte', () => {
  assert.ok(neu(gefecht({ statistik: { trefferNachFinte: 1 } })).includes('finteTreffer'));
});

test('tiefstossSchwer: ein Tiefstoß-Treffer gegen Schwer', () => {
  assert.ok(neu(gefecht({ stufe: 'schwer', statistik: { tiefstossTreffer: 1 } })).includes('tiefstossSchwer'));
  assert.ok(!neu(gefecht({ stufe: 'mittel', statistik: { tiefstossTreffer: 1 } })).includes('tiefstossSchwer'));
});

test('flechen10: zehn parierte Flèchen über mehrere Gefechte', () => {
  let daten = leer();
  for (let i = 0; i < 3; i++) daten = pruefe(daten, gefecht({ statistik: { flechenPariert: 3 } })).daten;
  assert.deepEqual(fortschritt(daten, 'flechen10'), { stand: 9, ziel: 10 });
  assert.ok(!hatErfolg('flechen10', daten));
  assert.ok(neu(gefecht({ statistik: { flechenPariert: 1 } }), daten).includes('flechen10'));
});

test('riposten25: 25 Riposten-Treffer über mehrere Gefechte', () => {
  let daten = leer();
  for (let i = 0; i < 4; i++) daten = pruefe(daten, gefecht({ statistik: { riposten: 6 } })).daten;
  assert.ok(!hatErfolg('riposten25', daten));
  assert.ok(neu(gefecht({ statistik: { riposten: 1 } }), daten).includes('riposten25'));
});

test('siegSchwer: Sieg gegen Schwer', () => {
  assert.ok(neu(sieg({ stufe: 'schwer' })).includes('siegSchwer'));
  assert.ok(!neu(sieg({ stufe: 'mittel' })).includes('siegSchwer'));
});

test('zuNullSchwer: 5:0 gegen Schwer', () => {
  assert.ok(neu(sieg({ stufe: 'schwer', stand: { rot: 5, gruen: 0 } })).includes('zuNullSchwer'));
  assert.ok(!neu(sieg({ stufe: 'schwer', stand: { rot: 5, gruen: 1 } })).includes('zuNullSchwer'));
});

test('verlaengerung: Sieg in der Verlängerung', () => {
  assert.ok(neu(sieg({ verlaengerung: true })).includes('verlaengerung'));
  assert.ok(!neu(gefecht({ verlaengerung: true })).includes('verlaengerung'));
});

test('aufholjagd: Sieg nach 0:3', () => {
  assert.ok(neu(sieg({ groessterRueckstand: 3 })).includes('aufholjagd'));
  assert.ok(!neu(sieg({ groessterRueckstand: 2 })).includes('aufholjagd'));
});

test('gefechte10, gefechte50, gefechte100: so viele Gefechte gegen den Computer', () => {
  let daten = leer();
  const freigeschaltet = [];
  for (let i = 1; i <= 100; i++) {
    const e = pruefe(daten, gefecht());
    daten = e.daten;
    for (const id of e.neu) freigeschaltet.push([id, i]);
  }
  assert.deepEqual(freigeschaltet, [['gefechte10', 10], ['gefechte50', 50], ['gefechte100', 100]]);
  assert.deepEqual(fortschritt(daten, 'gefechte100'), { stand: 100, ziel: 100 });
  // Das Training zählt nicht als Gefecht
  assert.equal(pruefe(leer(), { art: 'training', abgeschlossen: true }).daten.zaehler.gefechte, 0);
});

test('jede Regel ist getestet: jeder Erfolg lässt sich freischalten, aber nur einmal', () => {
  const ergebnisse = [
    gefecht({ stand: { rot: 1, gruen: 5 }, statistik: { trefferNachFinte: 1 } }),
    sieg({ stufe: 'schwer', stand: { rot: 5, gruen: 0 }, letzterTreffer: 'riposte', verlaengerung: true, groessterRueckstand: 3, statistik: { tiefstossTreffer: 1, flechenPariert: 10, riposten: 25 } }),
    { art: 'training', abgeschlossen: true },
  ];
  let daten = leer();
  const alle = [];
  for (let i = 0; i < 150; i++) {
    const e = pruefe(daten, ergebnisse[i % ergebnisse.length]);
    daten = e.daten;
    alle.push(...e.neu);
  }
  assert.deepEqual([...alle].sort(), ERFOLGE.map((e) => e.id).sort());
});

test('Erfolge und Zähler werden gespeichert und wieder geladen', () => {
  const speicher = { daten: {}, getItem: (k) => speicher.daten[k] ?? null, setItem: (k, v) => (speicher.daten[k] = v) };
  const { daten } = pruefe(leer(), sieg({ statistik: { flechenPariert: 4 } }), 1234);
  speichereErfolge(daten, speicher);
  const geladen = ladeErfolge(speicher);
  assert.deepEqual(geladen, daten);
  assert.ok(hatErfolg('ersterSieg', geladen));
  assert.equal(geladen.erreicht.ersterSieg, 1234);
  assert.equal(pruefe(geladen, gefecht({ statistik: { flechenPariert: 6 } })).neu.includes('flechen10'), true);
});

test('kaputte oder fehlende Daten führen nicht zum Absturz', () => {
  const mit = (wert) => ladeErfolge({ getItem: () => wert });
  assert.deepEqual(mit(null), leer());
  assert.deepEqual(mit('{kaputt'), leer());
  assert.deepEqual(mit('17'), leer());
  assert.deepEqual(ladeErfolge({ getItem: () => { throw new Error('gesperrt'); } }), leer());
  const teilweise = mit(JSON.stringify({ erreicht: { ersterSieg: 5, unbekannt: 1, training: 'gestern' }, zaehler: { gefechte: 7, riposten: -3, flechenPariert: 'viele' } }));
  assert.deepEqual(teilweise.erreicht, { ersterSieg: 5 });
  assert.deepEqual(teilweise.zaehler, { gefechte: 7, flechenPariert: 0, riposten: 0 });
  speichereErfolge(leer(), { setItem: () => { throw new Error('voll'); } }); // darf nicht werfen
});
