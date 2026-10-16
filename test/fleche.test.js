import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schlagabtausch, zweiFechter, fernsteuerung, BILD, ENDLINIEN } from './hilfen.js';
import { halteAbstand, MIN_ABSTAND } from '../src/abstand.js';

const REAKTION = 220;

test('die Flèche trifft aus mittlerer Distanz, aus der kein Ausfall mehr reicht', () => {
  assert.deepEqual(schlagabtausch({ abstand: 250, aktionRot: 'fleche' }), ['rot trifft']);
  assert.deepEqual(schlagabtausch({ abstand: 250, aktionRot: 'ausfall' }), []);
});

test('aus großer Distanz verfehlt die Flèche', () => {
  assert.deepEqual(schlagabtausch({ abstand: 300, aktionRot: 'fleche' }), []);
});

// Bei der Flèche reagiert man auf den sichtbaren Sprint, der nach dem Antritt (300 ms) beginnt
const SPRINT = 300;

test('eine Flèche lässt sich parieren, wenn man auf ihren Sprint reagiert', () => {
  const e = schlagabtausch({ abstand: 250, aktionRot: 'fleche', aktionGruen: 'parade', zeitGruen: SPRINT + REAKTION });
  assert.deepEqual(e, ['gruen pariert', 'gruen trifft']);
});

test('der Tiefstoß taucht unter der Flèche weg und trifft', () => {
  const e = schlagabtausch({ abstand: 250, aktionRot: 'fleche', aktionGruen: 'tiefstoss', zeitGruen: REAKTION });
  assert.deepEqual(e, ['gruen trifft']);
});

test('die Flèche läuft nicht in den Gegner hinein', () => {
  const sr = fernsteuerung();
  const { rot, gruen } = zweiFechter(400, sr);
  sr.druck.add('fleche');
  let kleinsterAbstand = Infinity;
  for (let t = 0; t < 1500; t += BILD) {
    const vorher = [rot.x, gruen.x];
    rot.aktualisiere(t, BILD, gruen);
    gruen.aktualisiere(t, BILD, rot);
    halteAbstand(rot, gruen, ...vorher, ENDLINIEN);
    kleinsterAbstand = Math.min(kleinsterAbstand, gruen.x - rot.x);
  }
  assert.ok(kleinsterAbstand >= MIN_ABSTAND - 1e-9, `Abstand ${kleinsterAbstand}`);
});
