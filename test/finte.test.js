// Finte: ausholen, abbrechen (Stoß ein zweites Mal drücken) und dann wirklich zustoßen
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schlagabtausch, zweiFechter, fernsteuerung, BILD } from './hilfen.js';

const REAKTION = 220;
// Rot holt bei 0 aus, bricht bei 240 ab (Finte) und stößt bei 260 wirklich zu
const FINTE_UND_STOSS = [[0, 'stoss'], [240, 'stoss'], [260, 'stoss']];

test('wer auf eine Finte hereinfällt und pariert, wird vom echten Stoß getroffen', () => {
  const e = schlagabtausch({ abstand: 120, folgeRot: FINTE_UND_STOSS, aktionGruen: 'parade', zeitGruen: REAKTION });
  assert.deepEqual(e, ['rot trifft']);
});

test('ohne Finte hätte dieselbe Parade den Stoß abgewehrt', () => {
  const e = schlagabtausch({ abstand: 120, aktionRot: 'stoss', aktionGruen: 'parade', zeitGruen: REAKTION });
  assert.deepEqual(e, ['gruen pariert', 'gruen trifft']);
});

test('wer die Finte durchschaut und erst den echten Stoß pariert, wehrt ihn ab', () => {
  const e = schlagabtausch({ abstand: 120, folgeRot: FINTE_UND_STOSS, aktionGruen: 'parade', zeitGruen: 260 + REAKTION });
  assert.deepEqual(e, ['gruen pariert', 'gruen trifft']);
});

test('eine Finte allein trifft nicht und lässt den Fechter sofort wieder frei', () => {
  const sr = fernsteuerung();
  const { rot, gruen } = zweiFechter(120, sr);
  for (let t = 0; t < 600; t += BILD) {
    if (t === 0 || t === 240) sr.druck.add('stoss');
    rot.aktualisiere(t, BILD, gruen);
    assert.equal(rot.pruefeStoss(gruen), null);
  }
  assert.equal(rot.aktion, null);
  assert.equal(rot.finten, 1);
});

test('auch ein Ausfall lässt sich als Finte abbrechen', () => {
  const e = schlagabtausch({
    abstand: 200,
    folgeRot: [[0, 'ausfall'], [250, 'stoss'], [280, 'ausfall']],
    aktionGruen: 'parade',
    zeitGruen: REAKTION,
  });
  assert.deepEqual(e, ['rot trifft']);
});

test('nach dem Zustoßen lässt sich ein Angriff nicht mehr abbrechen', () => {
  const sr = fernsteuerung();
  const { rot, gruen } = zweiFechter(120, sr);
  const treffer = [];
  for (let t = 0; t < 600; t += BILD) {
    if (t === 0 || t === 320) sr.druck.add('stoss'); // zweiter Druck erst in der aktiven Phase
    rot.aktualisiere(t, BILD, gruen);
    if (rot.pruefeStoss(gruen) === 'treffer') treffer.push(t);
  }
  assert.equal(treffer.length, 1);
  assert.equal(rot.finten, 0);
});
