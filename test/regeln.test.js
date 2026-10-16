// Regeln des Schlagabtauschs. REAKTION ist die Zeit, die ein Mensch braucht, um auf einen Angriff zu reagieren.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schlagabtausch } from './hilfen.js';

const REAKTION = 220;

test('ein Stoß ohne Gegenwehr trifft', () => {
  assert.deepEqual(schlagabtausch({ abstand: 120, aktionRot: 'stoss' }), ['rot trifft']);
});

test('ein Stoß aus zu großer Entfernung trifft nicht', () => {
  assert.deepEqual(schlagabtausch({ abstand: 200, aktionRot: 'stoss' }), []);
});

test('ein Ausfall trifft aus größerer Entfernung', () => {
  assert.deepEqual(schlagabtausch({ abstand: 200, aktionRot: 'ausfall' }), ['rot trifft']);
});

test('ein Stoß lässt sich mit menschlicher Reaktionszeit parieren, danach trifft die Riposte', () => {
  const e = schlagabtausch({ abstand: 120, aktionRot: 'stoss', aktionGruen: 'parade', zeitGruen: REAKTION });
  assert.deepEqual(e, ['gruen pariert', 'gruen trifft']);
});

test('ein Ausfall lässt sich parieren', () => {
  const e = schlagabtausch({ abstand: 200, aktionRot: 'ausfall', aktionGruen: 'parade', zeitGruen: REAKTION });
  assert.deepEqual(e, ['gruen pariert', 'gruen trifft']);
});

test('wer zu spät pariert, wird getroffen', () => {
  const e = schlagabtausch({ abstand: 120, aktionRot: 'stoss', aktionGruen: 'parade', zeitGruen: 350 });
  assert.deepEqual(e, ['rot trifft']);
});

test('unter einem Stoß wegtauchen: der Tiefstoß trifft', () => {
  const e = schlagabtausch({ abstand: 120, aktionRot: 'stoss', aktionGruen: 'tiefstoss', zeitGruen: REAKTION });
  assert.deepEqual(e, ['gruen trifft']);
});

test('in einen Tiefstoß hineinstoßen trifft sauber, ohne Doppeltreffer', () => {
  const e = schlagabtausch({ abstand: 110, aktionRot: 'tiefstoss', aktionGruen: 'stoss', zeitGruen: REAKTION });
  assert.deepEqual(e, ['gruen trifft']);
});

test('eine Parade gegen einen Tiefstoß geht ins Leere', () => {
  const e = schlagabtausch({ abstand: 110, aktionRot: 'tiefstoss', aktionGruen: 'parade', zeitGruen: REAKTION });
  assert.deepEqual(e, ['rot trifft']);
});

test('wer ins Leere pariert, ist verwundbar', () => {
  const e = schlagabtausch({ abstand: 120, aktionRot: 'parade', aktionGruen: 'stoss', zeitGruen: REAKTION });
  assert.deepEqual(e, ['gruen trifft']);
});

test('gleichzeitige Stöße ergeben einen Doppeltreffer', () => {
  const e = schlagabtausch({ abstand: 120, aktionRot: 'stoss', aktionGruen: 'stoss' });
  assert.deepEqual(e.sort(), ['gruen trifft', 'rot trifft']);
});
