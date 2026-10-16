import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STUECKE, frequenz } from '../src/musik.js';

test('MIDI-Noten werden in die richtige Frequenz umgerechnet', () => {
  assert.equal(frequenz(69), 440); // Kammerton a
  assert.equal(Math.round(frequenz(81)), 880); // eine Oktave höher
});

test('jedes Stück hat vollständige Takte', () => {
  for (const [name, s] of Object.entries(STUECKE)) {
    assert.equal(s.figur.length, 8, `${name}: die Begleitfigur hat 8 Achtel`);
    for (const akkord of s.akkorde) {
      assert.equal(akkord.toene.length, 3, `${name}: Dreiklang`);
      for (const i of s.figur) if (i !== null) assert.ok(i < akkord.toene.length, `${name}: Figur greift in den Akkord`);
      assert.ok(akkord.bass < Math.min(...akkord.toene), `${name}: Bass liegt unter dem Akkord`);
    }
  }
});
