import { test } from 'node:test';
import assert from 'node:assert/strict';
import Statistik from '../src/Statistik.js';

test('die Statistik zählt Angriffe, Treffer, Riposten, Paraden und Doppeltreffer', () => {
  const s = new Statistik();
  for (let i = 0; i < 4; i++) s.angriff('rot');
  s.angriff('gruen');
  s.treffer('rot', 'stoss');
  s.parade('gruen');
  s.treffer('gruen', 'riposte');
  s.treffer('rot', 'ausfall');
  s.treffer('gruen', 'stoss');
  s.doppeltreffer();

  assert.deepEqual(s.werte.rot, { angriffe: 4, treffer: 2, riposten: 0, paraden: 0, doppeltreffer: 1 });
  assert.deepEqual(s.werte.gruen, { angriffe: 1, treffer: 2, riposten: 1, paraden: 1, doppeltreffer: 1 });
  assert.equal(s.trefferquote('rot'), 50);
});

test('ohne Angriffe ist die Trefferquote 0 % statt eines Fehlers', () => {
  assert.equal(new Statistik().trefferquote('gruen'), 0);
});

test('die Anzeige hat für jede Zeile Bezeichnung, Rot und Grün als Text', () => {
  const zeilen = new Statistik().zeilen();
  assert.equal(zeilen.length, 6);
  for (const z of zeilen) {
    assert.equal(z.length, 3);
    assert.ok(z.every((zelle) => typeof zelle === 'string'));
  }
  assert.deepEqual(zeilen.at(-1), ['Trefferquote', '0 %', '0 %']);
});
