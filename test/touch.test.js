import { test } from 'node:test';
import assert from 'node:assert/strict';
import { knopfUnter, knopfMitte } from '../src/touch.js';

test('Ein Finger auf einem Knopf trifft diesen Knopf', () => {
  assert.equal(knopfUnter(868, 452, ['stoss', 'parade']), 'stoss');
  assert.equal(knopfUnter(85, 455, ['links', 'rechts']), 'links');
});

test('Knapp neben dem Knopf zählt noch, mitten im Bild nicht', () => {
  assert.equal(knopfUnter(868 + 70, 452, ['stoss']), 'stoss');
  assert.equal(knopfUnter(480, 300, ['links', 'rechts', 'stoss', 'parade', 'tiefstoss', 'fleche']), undefined);
});

test('Die Knöpfe überlappen sich nicht', () => {
  // Jede Knopfmitte gehört nur zu ihrem eigenen Knopf
  const namen = ['links', 'rechts', 'stoss', 'parade', 'tiefstoss', 'fleche'];
  for (const name of namen) {
    const { x, y } = knopfMitte(name);
    const andere = namen.filter((n) => n !== name);
    assert.equal(knopfUnter(x, y, andere), undefined, name);
  }
});

test('Der Knopf für den Tiefstoß liegt ganz unten, neben der Parade', () => {
  const tief = knopfMitte('tiefstoss');
  assert.ok(tief.y >= knopfMitte('parade').y);
  assert.ok(tief.x < knopfMitte('parade').x);
});

test('Auf breiten Bildschirmen bleiben die Knöpfe in den unteren Ecken', () => {
  // Handy mit 20:9 – das Spielbild ist dann 1200 × 540 groß
  assert.deepEqual(knopfMitte('links', 1200, 540), { x: 85, y: 455 });
  assert.deepEqual(knopfMitte('stoss', 1200, 540), { x: 868 + 240, y: 452 });
  assert.equal(knopfUnter(868 + 240, 452, ['stoss'], 1200, 540), 'stoss');
  assert.equal(knopfUnter(868, 452, ['stoss'], 1200, 540), undefined);
});
