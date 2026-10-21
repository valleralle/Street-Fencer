// Issue #29: Ringpuffer für die Wiederholung am Gefechtsende
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Aufzeichnung, { aktionsFolge } from '../src/Aufzeichnung.js';
import Computergegner from '../src/Computergegner.js';
import { BILD, ganzesGefecht, zufall } from './hilfen.js';

test('der Ringpuffer hält nur die letzten Millisekunden, älteste zuerst', () => {
  const a = new Aufzeichnung(1000);
  for (let t = 0; t <= 5000; t += BILD) a.nimmAuf(t, { nummer: t });
  const zeiten = a.bilder.map((b) => b.zeit);
  assert.ok(zeiten[0] >= 5000 - 16 - 1000 && zeiten.at(-1) === 4992, `${zeiten[0]} … ${zeiten.at(-1)}`);
  assert.deepEqual(zeiten, [...zeiten].sort((x, y) => x - y));
  const letzte = a.letzte(200);
  assert.ok(letzte.every((b) => b.zeit >= 4992 - 200));
  assert.equal(letzte.at(-1).nummer, 4992);
  assert.deepEqual(a.ab(4900).map((b) => b.zeit), zeiten.filter((z) => z >= 4900));
  a.leere();
  assert.deepEqual(a.letzte(200), []);
});

const bild = (aktion, aktionStart, finten = 0) => ({ aktion, aktionStart, finten });

test('aus der Aufzeichnung wird die Folge der Aktionen, ein abgebrochener Angriff wird zur Finte', () => {
  const bilder = [
    { rot: bild(null, 0), gruen: bild(null, 0) },
    { rot: bild('stoss', 100), gruen: bild(null, 0) },
    { rot: bild(null, 100, 1), gruen: bild(null, 0) }, // Finte
    { rot: bild('ausfall', 300, 1), gruen: bild('parade', 350) },
    { rot: bild('ausfall', 300, 1), gruen: bild('parade', 350) },
    { rot: bild(null, 300, 1), gruen: bild('riposte', 700) },
  ];
  assert.deepEqual(aktionsFolge(bilder, 'rot'), ['finte', 'ausfall']);
  assert.deepEqual(aktionsFolge(bilder, 'gruen'), ['parade', 'riposte']);
  assert.deepEqual(aktionsFolge([], 'rot'), []);
});

test('die Aufzeichnung verändert das Gefecht nicht', () => {
  for (let i = 0; i < 5; i++) {
    const gefecht = (aufnehmen) => {
      const a = new Aufzeichnung(3000);
      const g = ganzesGefecht(
        new Computergegner('mittel', zufall(40 + i)),
        new Computergegner('schwer', zufall(50 + i)),
        i + 1,
        aufnehmen ? (t, rot, gruen) => a.nimmAuf(t, { rot: rot.momentaufnahme(), gruen: gruen.momentaufnahme() }) : null,
      );
      if (aufnehmen) assert.ok(a.bilder.length > 100);
      return { stand: g.stand, restzeit: g.restzeit, sieger: g.sieger };
    };
    assert.deepEqual(gefecht(true), gefecht(false));
  }
});
