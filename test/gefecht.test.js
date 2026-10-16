import { test } from 'node:test';
import assert from 'node:assert/strict';
import Gefecht from '../src/Gefecht.js';

const ROT = { rot: true, gruen: false };
const GRUEN = { rot: false, gruen: true };
const DOPPEL = { rot: true, gruen: true };

test('wer zuerst 5 Treffer hat, gewinnt', () => {
  const g = new Gefecht();
  for (let i = 0; i < 5; i++) g.werteAus(ROT);
  assert.equal(g.sieger, 'rot');
});

test('ein Doppeltreffer gibt beiden einen Punkt', () => {
  const g = new Gefecht();
  assert.equal(g.werteAus(DOPPEL), 'doppeltreffer');
  assert.deepEqual(g.stand, { rot: 1, gruen: 1 });
});

test('ein Doppeltreffer bei 4:3 entscheidet das Gefecht', () => {
  const g = new Gefecht();
  g.stand = { rot: 4, gruen: 3 };
  g.werteAus(DOPPEL);
  assert.equal(g.sieger, 'rot');
});

test('ein Doppeltreffer beim entscheidenden Treffer (4:4) wird gestrichen', () => {
  const g = new Gefecht();
  g.stand = { rot: 4, gruen: 4 };
  assert.equal(g.werteAus(DOPPEL), 'gestrichen');
  assert.deepEqual(g.stand, { rot: 4, gruen: 4 });
  assert.equal(g.sieger, null);
});

test('läuft die Zeit ab, gewinnt, wer vorne liegt', () => {
  const g = new Gefecht();
  g.werteAus(ROT);
  assert.equal(g.zeitVergeht(180_000), 'ende');
  assert.equal(g.sieger, 'rot');
});

test('bei Gleichstand nach Ablauf der Zeit gibt es eine Verlängerung mit ausgelostem Vorteil', () => {
  const g = new Gefecht(() => 0.9);
  assert.equal(g.zeitVergeht(200_000), 'verlaengerung');
  assert.equal(g.vorteil, 'gruen');
  assert.equal(g.restzeit, 60_000);
});

test('in der Verlängerung entscheidet der nächste Treffer', () => {
  const g = new Gefecht(() => 0.1);
  g.zeitVergeht(180_000);
  g.werteAus(GRUEN);
  assert.equal(g.sieger, 'gruen');
});

test('in der Verlängerung wird ein Doppeltreffer gestrichen', () => {
  const g = new Gefecht();
  g.zeitVergeht(180_000);
  assert.equal(g.werteAus(DOPPEL), 'gestrichen');
  assert.equal(g.sieger, null);
});

test('fällt in der Verlängerung kein Treffer, gewinnt der Fechter mit Vorteil', () => {
  const g = new Gefecht(() => 0.1);
  g.zeitVergeht(180_000);
  assert.equal(g.zeitVergeht(60_000), 'ende');
  assert.equal(g.sieger, 'rot');
});
