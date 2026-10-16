import { test } from 'node:test';
import assert from 'node:assert/strict';
import { knopfUnter } from '../src/touch.js';

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
  const mitten = { links: [85, 455], rechts: [225, 455], stoss: [868, 452], parade: [735, 487], tiefstoss: [765, 370], fleche: [882, 318] };
  for (const [name, [x, y]] of Object.entries(mitten)) {
    const andere = Object.keys(mitten).filter((n) => n !== name);
    assert.equal(knopfUnter(x, y, andere), undefined, name);
  }
});
