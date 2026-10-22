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

  s.finte('rot');
  assert.deepEqual(s.werte.rot, { angriffe: 4, finten: 1, treffer: 2, riposten: 0, paraden: 0, doppeltreffer: 1, flechenPariert: 0, trefferNachFinte: 0, tiefstossTreffer: 0 });
  assert.deepEqual(s.werte.gruen, { angriffe: 1, finten: 0, treffer: 2, riposten: 1, paraden: 1, doppeltreffer: 1, flechenPariert: 0, trefferNachFinte: 0, tiefstossTreffer: 0 });
  assert.equal(s.trefferquote('rot'), 50);
});

test('ohne Angriffe ist die Trefferquote 0 % statt eines Fehlers', () => {
  assert.equal(new Statistik().trefferquote('gruen'), 0);
});

test('die Anzeige hat für jede Zeile Bezeichnung, Rot und Grün als Text', () => {
  const zeilen = new Statistik().zeilen();
  assert.equal(zeilen.length, 7);
  for (const z of zeilen) {
    assert.equal(z.length, 3);
    assert.ok(z.every((zelle) => typeof zelle === 'string'));
  }
  assert.deepEqual(zeilen.at(-1), ['Trefferquote', '0 %', '0 %']);
});

test('für die Erfolge zählt sie parierte Flèchen, Treffer nach Finte und Tiefstoß-Treffer', () => {
  const s = new Statistik();
  s.parade('rot', 'fleche');
  s.parade('rot', 'stoss');
  s.treffer('rot', 'tiefstoss');
  s.treffer('rot', 'stoss', true);
  assert.equal(s.werte.rot.paraden, 2);
  assert.equal(s.werte.rot.flechenPariert, 1);
  assert.equal(s.werte.rot.tiefstossTreffer, 1);
  assert.equal(s.werte.rot.trefferNachFinte, 1);
});
