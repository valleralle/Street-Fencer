import { test } from 'node:test';
import assert from 'node:assert/strict';
import { halteAbstand, MIN_ABSTAND } from '../src/abstand.js';
import { ENDLINIEN } from './hilfen.js';

test('wer zu nah herankommt, bleibt stehen – der Gegner wird nicht weggeschoben', () => {
  const rot = { x: 450 };
  const gruen = { x: 500 };
  halteAbstand(rot, gruen, 420, 500, ENDLINIEN); // nur Rot ist vorgelaufen
  assert.equal(gruen.x, 500);
  assert.equal(gruen.x - rot.x, MIN_ABSTAND);
});

test('laufen beide aufeinander zu, werden beide anteilig zurückgehalten', () => {
  const rot = { x: 470 };
  const gruen = { x: 490 };
  halteAbstand(rot, gruen, 450, 510, ENDLINIEN);
  assert.equal(gruen.x - rot.x, MIN_ABSTAND);
  assert.ok(rot.x < 470 && gruen.x > 490);
});

test('niemand kommt über die Endlinien', () => {
  const rot = { x: 0 };
  const gruen = { x: 2000 };
  halteAbstand(rot, gruen, 0, 2000, ENDLINIEN);
  assert.ok(rot.x >= ENDLINIEN.links);
  assert.ok(gruen.x <= ENDLINIEN.rechts);
});
