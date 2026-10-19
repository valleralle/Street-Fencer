import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STANDARD,
  ladeEinstellungen,
  speichereEinstellungen,
  aendereLautstaerke,
  belegeTaste,
  setzeZurueck,
  tastenName,
} from '../src/einstellungen.js';

function speicher(daten = {}) {
  return {
    daten,
    getItem: (k) => daten[k] ?? null,
    setItem: (k, v) => (daten[k] = v),
    removeItem: (k) => delete daten[k],
  };
}

test('ohne gespeicherte Einstellungen gilt der Standard', () => {
  assert.deepEqual(ladeEinstellungen(speicher()), STANDARD);
});

test('ohne Speicher (z. B. privates Fenster) gilt der Standard, ohne Fehler', () => {
  assert.deepEqual(ladeEinstellungen(undefined), STANDARD);
  const kaputt = { getItem: () => { throw new Error('gesperrt'); } };
  assert.deepEqual(ladeEinstellungen(kaputt), STANDARD);
});

test('gespeicherte Einstellungen werden wieder geladen', () => {
  const s = speicher();
  const e = ladeEinstellungen(s);
  aendereLautstaerke(e, 'musik', -2);
  belegeTaste(e, 'rot', 'stoss', 'Q');
  speichereEinstellungen(e, s);
  const neu = ladeEinstellungen(s);
  assert.equal(neu.musik, 0.3);
  assert.equal(neu.tasten.rot.stoss, 'Q');
});

test('kaputte gespeicherte Daten werden ignoriert', () => {
  const s = speicher();
  s.setItem('street-fencer.einstellungen', '{kein json');
  assert.deepEqual(ladeEinstellungen(s), STANDARD);
});

test('Einstellungen unter dem alten Schlüssel game_pilot werden übernommen', () => {
  const s = speicher({ 'game_pilot.einstellungen': JSON.stringify({ musik: 0.2, tasten: { rot: { stoss: 'Q' } } }) });
  const e = ladeEinstellungen(s);
  assert.equal(e.musik, 0.2);
  assert.equal(e.tasten.rot.stoss, 'Q');
  assert.deepEqual(Object.keys(s.daten), ['street-fencer.einstellungen']);
  speichereEinstellungen(e, s);
  assert.equal(ladeEinstellungen(s).tasten.rot.stoss, 'Q');
});

test('gibt es beide Schlüssel, gilt der neue', () => {
  const s = speicher({
    'game_pilot.einstellungen': JSON.stringify({ musik: 0.2 }),
    'street-fencer.einstellungen': JSON.stringify({ musik: 0.9 }),
  });
  assert.equal(ladeEinstellungen(s).musik, 0.9);
});

test('kaputte Daten unter dem alten Schlüssel ergeben den Standard', () => {
  const s = speicher({ 'game_pilot.einstellungen': '{kein json' });
  assert.deepEqual(ladeEinstellungen(s), STANDARD);
});

test('die Lautstärke bleibt zwischen 0 und 100 %', () => {
  const e = ladeEinstellungen(speicher());
  aendereLautstaerke(e, 'effekte', 5);
  assert.equal(e.effekte, 1);
  aendereLautstaerke(e, 'effekte', -20);
  assert.equal(e.effekte, 0);
});

test('eine schon belegte Taste wird getauscht – nie zwei Aktionen auf einer Taste', () => {
  const e = ladeEinstellungen(speicher());
  belegeTaste(e, 'rot', 'stoss', 'G'); // G war die Parade von Rot
  assert.equal(e.tasten.rot.stoss, 'G');
  assert.equal(e.tasten.rot.parade, 'F');
  belegeTaste(e, 'rot', 'fleche', 'K'); // K war der Stoß von Grün
  assert.equal(e.tasten.rot.fleche, 'K');
  assert.equal(e.tasten.gruen.stoss, 'R');
});

test('Pause- und Menütasten lassen sich nicht belegen', () => {
  const e = ladeEinstellungen(speicher());
  assert.equal(belegeTaste(e, 'rot', 'stoss', 'P'), false);
  assert.equal(belegeTaste(e, 'rot', 'stoss', 'ESC'), false);
  assert.equal(e.tasten.rot.stoss, 'F');
});

test('Zurücksetzen stellt den Standard wieder her', () => {
  const e = ladeEinstellungen(speicher());
  belegeTaste(e, 'gruen', 'links', 'Z');
  aendereLautstaerke(e, 'musik', 3);
  assert.deepEqual(setzeZurueck(e), STANDARD);
});

test('Tastennamen sind lesbar', () => {
  assert.equal(tastenName('LEFT'), 'Pfeil links');
  assert.equal(tastenName('DOWN'), '↓');
  assert.equal(tastenName('F'), 'F');
});
