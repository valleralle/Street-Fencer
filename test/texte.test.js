import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WOERTERBUECHER, text, ohneFi } from '../src/texte.js';
import { SPRACHEN, ladeEinstellungen, standardSprache, wechsleSprache, einstellungen } from '../src/einstellungen.js';
import { LEKTIONEN, bedienung } from '../src/lektionen.js';

const platzhalter = (t) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('jeder Text gibt es auf Deutsch und auf Englisch', () => {
  const de = Object.keys(WOERTERBUECHER.de).sort();
  const en = Object.keys(WOERTERBUECHER.en).sort();
  assert.deepEqual(en.filter((k) => !de.includes(k)), [], 'nur auf Englisch');
  assert.deepEqual(de.filter((k) => !en.includes(k)), [], 'nur auf Deutsch');
});

test('alle Platzhalter eines Textes kommen in beiden Sprachen vor', () => {
  for (const [schluessel, deutsch] of Object.entries(WOERTERBUECHER.de)) {
    assert.deepEqual(platzhalter(WOERTERBUECHER.en[schluessel]), platzhalter(deutsch), schluessel);
  }
});

test('„fi“ und „fl“ werden getrennt, damit die Pixelschrift keine Ligatur daraus macht – sonst bleibt alles gleich', () => {
  assert.equal(ohneFi('fight first finish'), 'f‌ight f‌irst f‌inish');
  assert.equal(ohneFi(ohneFi('fi')), 'f‌i');
  assert.equal(ohneFi('Treffer – Flèche'), 'Treffer – Flèche');
  assert.equal(ohneFi('the flèche'), 'the f‌lèche'); // „fl“ ebenso
  assert.ok(!/fi/.test(text('steuerung.touchRegeln', {}, 'en')), 'die Texte kommen schon getrennt');
});

test('Texte mit Platzhaltern in beiden Sprachen', () => {
  assert.equal(text('kampf.treffer', { farbe: 'Rot' }, 'de'), 'Treffer Rot!');
  assert.equal(text('kampf.treffer', { farbe: 'Red' }, 'en'), 'Touch Red!');
  assert.equal(text('training.nummer', { nummer: 3, gesamt: 8 }, 'en'), 'Training · lesson 3 of 8');
});

test('beim ersten Start gilt die Sprache des Browsers, eine gespeicherte Wahl hat Vorrang', () => {
  assert.equal(standardSprache('en-US'), 'en');
  assert.equal(standardSprache('en'), 'en');
  assert.equal(standardSprache('de-DE'), 'de');
  assert.equal(standardSprache('fr-FR'), 'de');
  assert.equal(standardSprache(undefined), 'de');
  const leer = { getItem: () => null, setItem: () => {} };
  assert.equal(ladeEinstellungen(leer, 'en-GB').sprache, 'en');
  const gespeichert = { getItem: () => JSON.stringify({ sprache: 'de' }), setItem: () => {} };
  assert.equal(ladeEinstellungen(gespeichert, 'en-GB').sprache, 'de');
  const unsinn = { getItem: () => JSON.stringify({ sprache: 'xx' }), setItem: () => {} };
  assert.equal(ladeEinstellungen(unsinn, 'de-AT').sprache, 'de');
});

test('die Sprache lässt sich in den Einstellungen wechseln', () => {
  const e = { sprache: 'de' };
  assert.equal(wechsleSprache(e).sprache, 'en');
  assert.equal(wechsleSprache(e).sprache, 'de');
  assert.equal(wechsleSprache(e, -1).sprache, 'en');
  assert.deepEqual(SPRACHEN, ['de', 'en']);
});

test('auf Englisch nennen die Lektionen die englischen Verben und Knöpfe', () => {
  const vorher = einstellungen.sprache;
  einstellungen.sprache = 'en';
  try {
    const tasten = { links: 'A', rechts: 'D', stoss: 'F', parade: 'G', tiefstoss: 'S', fleche: 'R' };
    assert.equal(LEKTIONEN[2].titel, 'Lunge');
    assert.equal(LEKTIONEN[2].text(bedienung(tasten)), 'From further away: hold D and press F at the same time.');
    assert.equal(LEKTIONEN[3].text(bedienung(tasten, true)), 'The coach attacks. Tap “Parry” the moment the coach draws back.');
    for (const l of LEKTIONEN) assert.ok(!/\{|undefined/.test(l.text(bedienung(tasten, true))), l.id);
  } finally {
    einstellungen.sprache = vorher;
  }
});
