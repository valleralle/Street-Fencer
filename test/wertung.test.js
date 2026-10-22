// Issue #26: Wertungszahl gegen den Computer
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  START,
  STUFEN_WERTUNG,
  RAENGE,
  neueWertung,
  rang,
  trageEin,
  aufstieg,
  quoten,
  aktuelleWertung,
  ladeVerlauf,
  speichereVerlauf,
  VERLAUF_LAENGE,
} from '../src/Wertung.js';
import { text } from '../src/texte.js';

function speicher(daten = {}) {
  return {
    daten,
    getItem: (k) => daten[k] ?? null,
    setItem: (k, v) => (daten[k] = v),
  };
}

test('ein Sieg gegen einen Stärkeren bringt mehr als gegen einen Schwächeren', () => {
  assert.ok(neueWertung(1000, 1500, true) - 1000 > neueWertung(1000, 900, true) - 1000);
});

test('eine Niederlage gegen einen Schwächeren kostet mehr als gegen einen Stärkeren', () => {
  assert.ok(1000 - neueWertung(1000, 900, false) > 1000 - neueWertung(1000, 1500, false));
});

test('die Änderungen beider Fechter heben sich auf', () => {
  for (const [a, b] of [[1000, 900], [1000, 1500], [1234, 1200], [800, 1600]]) {
    for (const sieg of [true, false]) {
      const fuerA = neueWertung(a, b, sieg) - a;
      const fuerB = neueWertung(b, a, !sieg) - b;
      assert.ok(Math.abs(fuerA + fuerB) <= 1, `${a} gegen ${b}: ${fuerA} und ${fuerB}`); // höchstens Rundung
    }
  }
});

test('die Ränge gelten ab ihrer Grenze', () => {
  assert.equal(rang(START), 'anfaenger');
  for (const [name, ab] of RAENGE.slice(1)) {
    assert.equal(rang(ab), name);
    assert.notEqual(rang(ab - 1), name);
  }
  assert.equal(rang(3000), 'meister');
  for (const sprache of ['de', 'en']) {
    for (const [name] of RAENGE) assert.ok(text(`rang.${name}`, {}, sprache), `${sprache}: rang.${name}`);
  }
});

test('ein Gefecht wird eingetragen, mit Änderung und Aufstieg', () => {
  const vorher = [{ datum: 1, stufe: 'leicht', sieg: true, treffer: 5, gegentreffer: 1, wertung: 1045 }];
  const e = trageEin(vorher, { stufe: 'schwer', sieg: true, treffer: 5, gegentreffer: 4, datum: 2 });
  assert.equal(e.alt, 1045);
  assert.equal(e.neu, neueWertung(1045, STUFEN_WERTUNG.schwer, true));
  assert.equal(e.aenderung, e.neu - 1045);
  assert.equal(e.verlauf.length, 2);
  assert.equal(aktuelleWertung(e.verlauf), e.neu);
  assert.equal(aufstieg(e), 'vereinsfechter');
  assert.equal(aufstieg(trageEin(vorher, { stufe: 'leicht', sieg: false, treffer: 0, gegentreffer: 5 })), null);
  assert.equal(aktuelleWertung([]), START);
});

test('der Verlauf hält die letzten 100 Gefechte', () => {
  let verlauf = [];
  for (let i = 0; i < VERLAUF_LAENGE + 20; i++) verlauf = trageEin(verlauf, { stufe: 'mittel', sieg: i % 2 === 0, treffer: 3, gegentreffer: 3, datum: i }).verlauf;
  assert.equal(verlauf.length, VERLAUF_LAENGE);
  assert.equal(verlauf[0].datum, 20);
});

test('Sieg- und Trefferquote der letzten 20 Gefechte', () => {
  const verlauf = [
    ...Array.from({ length: 10 }, (_, i) => ({ datum: i, stufe: 'leicht', sieg: false, treffer: 0, gegentreffer: 5, wertung: 900 })),
    ...Array.from({ length: 20 }, (_, i) => ({ datum: 10 + i, stufe: 'mittel', sieg: i < 15, treffer: 3, gegentreffer: 1, wertung: 1100 })),
  ];
  assert.deepEqual(quoten(verlauf), { gefechte: 20, siegquote: 75, trefferquote: 75 });
  assert.deepEqual(quoten([]), { gefechte: 0, siegquote: 0, trefferquote: 0 });
});

test('der Verlauf wird gespeichert und wieder geladen', () => {
  const s = speicher();
  assert.deepEqual(ladeVerlauf(s), []);
  const { verlauf } = trageEin([], { stufe: 'mittel', sieg: true, treffer: 5, gegentreffer: 2, datum: 7 });
  speichereVerlauf(verlauf, s);
  assert.deepEqual(ladeVerlauf(s), verlauf);
});

test('kaputte Daten ergeben einen leeren Verlauf, kaputte Einträge fallen weg', () => {
  assert.deepEqual(ladeVerlauf(speicher({ 'street-fencer.wertung': '{kaputt' })), []);
  assert.deepEqual(ladeVerlauf(speicher({ 'street-fencer.wertung': '{"a":1}' })), []);
  assert.deepEqual(ladeVerlauf({ getItem: () => { throw new Error('gesperrt'); } }), []);
  const gut = { datum: 1, stufe: 'mittel', sieg: true, treffer: 5, gegentreffer: 2, wertung: 1020 };
  const daten = JSON.stringify([gut, null, { ...gut, stufe: 'unmöglich' }, { ...gut, wertung: 'viel' }]);
  assert.deepEqual(ladeVerlauf(speicher({ 'street-fencer.wertung': daten })), [gut]);
  speichereVerlauf([gut], { setItem: () => { throw new Error('voll'); } }); // darf nicht werfen
});
