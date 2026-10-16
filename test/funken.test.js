import { test } from 'node:test';
import assert from 'node:assert/strict';
import Funken from '../src/Funken.js';
import { zufall } from './hilfen.js';

// Grafik-Attrappe: jede Methode gibt sie selbst zurück
const grafik = new Proxy({}, { get: (_, name) => (name === 'then' ? undefined : () => grafik) });
const szene = { add: { graphics: () => grafik } };

test('Funken stieben auseinander, fallen nach unten und verglühen', () => {
  const f = new Funken(szene, zufall(3));
  f.spruehe(100, 300, 1, 10);
  assert.equal(f.teile.length, 10);

  f.aktualisiere(100);
  assert.ok(f.teile.every((t) => t.x !== 100), 'alle Funken haben sich bewegt');
  const vy = f.teile.map((t) => t.vy);
  f.aktualisiere(100);
  assert.ok(f.teile.every((t, i) => t.vy > vy[i]), 'die Schwerkraft zieht sie nach unten');

  for (let i = 0; i < 20; i++) f.aktualisiere(50);
  assert.equal(f.teile.length, 0, 'nach spätestens 0,55 s sind alle verglüht');
});
