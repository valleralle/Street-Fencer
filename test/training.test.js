import { test } from 'node:test';
import assert from 'node:assert/strict';
import Trainer from '../src/Trainer.js';
import { LEKTIONEN } from '../src/lektionen.js';
import { zweiFechter, fernsteuerung, BILD, ENDLINIEN } from './hilfen.js';
import { halteAbstand } from '../src/abstand.js';

// Spielt eine Übung gegen den Trainer und liefert das erste Ereignis (Parade oder Treffer)
function uebe({ verhalten, abstand, spieler = () => {} }) {
  const sr = fernsteuerung();
  const trainer = new Trainer(verhalten);
  const { rot, gruen } = zweiFechter(abstand, sr, trainer);
  for (let t = 0; t < 8000; t += BILD) {
    spieler(t, sr, gruen);
    trainer.denke(t, gruen, rot);
    const vorher = [rot.x, gruen.x];
    rot.aktualisiere(t, BILD, gruen);
    gruen.aktualisiere(t, BILD, rot);
    sr.halte = {};
    halteAbstand(rot, gruen, ...vorher, ENDLINIEN);
    for (const [a, b] of [[rot, gruen], [gruen, rot]]) {
      const e = a.pruefeStoss(b);
      if (e === 'pariert') return { art: 'parade', farbe: b.name };
      if (e === 'treffer') return { art: 'treffer', farbe: a.name, aktion: a.aktion };
    }
  }
  return null;
}

// Spieler, der 220 ms nach dem Ausholen des Trainers mit einer Aktion reagiert
const reagiertMit = (aktion) => {
  let ausholenSeit = null;
  return (t, sr, trainer) => {
    if (trainer.aktion === 'stoss' && ausholenSeit === null) ausholenSeit = t;
    if (ausholenSeit !== null && t - ausholenSeit >= 220 && t - ausholenSeit < 220 + BILD) sr.druck.add(aktion);
  };
};

test('ein stehender Trainer greift nicht an', () => {
  assert.equal(uebe({ verhalten: 'stehen', abstand: 180 }), null);
});

test('der angreifende Trainer kommt heran und trifft, wenn man sich nicht wehrt', () => {
  assert.deepEqual(uebe({ verhalten: 'angreifen', abstand: 180 }), { art: 'treffer', farbe: 'gruen', aktion: 'stoss' });
});

test('seine Angriffe lassen sich mit menschlicher Reaktionszeit parieren', () => {
  const e = uebe({ verhalten: 'angreifen', abstand: 180, spieler: reagiertMit('parade') });
  assert.deepEqual(e, { art: 'parade', farbe: 'rot' });
  assert.ok(LEKTIONEN.find((l) => l.titel === 'Parade').ziel(e));
});

test('unter seinen Angriffen kann man mit dem Tiefstoß wegtauchen', () => {
  const e = uebe({ verhalten: 'angreifen', abstand: 180, spieler: reagiertMit('tiefstoss') });
  assert.ok(LEKTIONEN.find((l) => l.titel === 'Tiefstoß').ziel(e), JSON.stringify(e));
});

test('jede Lektion hat Titel, Anleitung mit Tastennamen und ein Ziel', () => {
  const tasten = { links: 'A', rechts: 'D', stoss: 'F', parade: 'G', tiefstoss: 'S', fleche: 'R' };
  for (const l of LEKTIONEN) {
    assert.ok(l.titel && typeof l.ziel === 'function');
    assert.ok(!l.text(tasten).includes('undefined'), l.titel);
  }
});

test('die Lektionen erkennen genau die geforderte Aktion', () => {
  const stoss = LEKTIONEN.find((l) => l.titel === 'Stoß');
  assert.ok(stoss.ziel({ art: 'treffer', farbe: 'rot', aktion: 'stoss' }));
  assert.ok(!stoss.ziel({ art: 'treffer', farbe: 'rot', aktion: 'ausfall' }));
  assert.ok(!stoss.ziel({ art: 'treffer', farbe: 'gruen', aktion: 'stoss' }));
  assert.ok(LEKTIONEN[0].ziel({ art: 'bewegt', strecke: 250 }));
});

// Spieler, der Stoß zu den angegebenen Zeiten drückt
const drueckt = (...zeiten) => (t, sr) => {
  if (zeiten.includes(t)) sr.druck.add('stoss');
};

test('der parierende Trainer wehrt einen einfachen Stoß ab', () => {
  const e = uebe({ verhalten: 'pariert', abstand: 120, spieler: drueckt(0) });
  assert.deepEqual(e, { art: 'parade', farbe: 'gruen' });
});

test('mit einer Finte im Rhythmus trifft man den parierenden Trainer – das erfüllt die Lektion', () => {
  const e = uebe({ verhalten: 'pariert', abstand: 120, spieler: drueckt(0, 128, 240) });
  assert.equal(e.art, 'treffer');
  assert.equal(e.farbe, 'rot');
  assert.ok(LEKTIONEN.find((l) => l.titel === 'Finte').ziel({ ...e, nachFinte: true }));
});

test('wer zu schnell antäuscht, landet mit dem echten Stoß noch in der Parade', () => {
  const e = uebe({ verhalten: 'pariert', abstand: 120, spieler: drueckt(0, 48, 96) });
  assert.deepEqual(e, { art: 'parade', farbe: 'gruen' });
});
