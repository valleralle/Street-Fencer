import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZIFFERN } from '../src/pixelart/ziffern.js';

test('jede Ziffer 0–9 und der Doppelpunkt sind definiert', () => {
  for (const z of [...'0123456789:']) assert.ok(ZIFFERN[z], z);
});

test('alle Ziffern sind gleich hoch und gleich breit (5 × 7 wie Pixelify Sans)', () => {
  for (const [z, raster] of Object.entries(ZIFFERN)) {
    assert.equal(raster.length, 7, z);
    for (const zeile of raster) assert.match(zeile, z === ':' ? /^[.#]$/ : /^[.#]{5}$/, z);
  }
});

test('die 5 hat einen geraden, eckigen Kopf, die 2 einen runden Bogen', () => {
  // So unterscheiden sie sich von S und Z (Issue #8)
  assert.equal(ZIFFERN[5][0], '#####');
  assert.equal(ZIFFERN[5][1][0], '#');
  assert.equal(ZIFFERN[2][0], '.###.');
});
