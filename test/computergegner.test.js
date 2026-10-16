// Ganze Gefechte gegen den Computergegner – mit festem Zufall, damit das Ergebnis immer gleich ist
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Computergegner, { STUFEN } from '../src/Computergegner.js';
import { ganzesGefecht, passiverSpieler, draufgaenger, zufall, fernsteuerung, zweiFechter, BILD } from './hilfen.js';

const GEFECHTE = 30;

// Anteil der Gefechte, die Grün (der zweite Computergegner bzw. die zweite Steuerung) gewinnt
function siegquote(rotErzeugen, gruenErzeugen) {
  let siege = 0;
  for (let i = 0; i < GEFECHTE; i++) {
    if (ganzesGefecht(rotErzeugen(i), gruenErzeugen(i), i + 1).sieger === 'gruen') siege++;
  }
  return siege / GEFECHTE;
}
const computer = (stufe, versatz) => (i) => new Computergegner(stufe, zufall(1000 * versatz + i));

test('jede Stufe gewinnt gegen einen Spieler, der nichts tut', () => {
  for (const stufe of ['leicht', 'mittel', 'schwer']) {
    assert.equal(siegquote(passiverSpieler, computer(stufe, 1)), 1, stufe);
  }
});

test('die Stufen sind spürbar unterschiedlich stark', () => {
  const leicht = siegquote(computer('mittel', 2), computer('leicht', 3));
  const mittel = siegquote(computer('mittel', 4), computer('mittel', 5));
  const schwer = siegquote(computer('mittel', 6), computer('schwer', 7));
  assert.ok(leicht < mittel && mittel < schwer, `leicht ${leicht}, mittel ${mittel}, schwer ${schwer}`);
  assert.ok(mittel > 0.25 && mittel < 0.75, `mittel gegen mittel sollte ausgeglichen sein: ${mittel}`);
});

test('„leicht“ ist für einen sturen Draufgänger schlagbar, „schwer“ kaum', () => {
  const leicht = siegquote(draufgaenger, computer('leicht', 8));
  const schwer = siegquote(draufgaenger, computer('schwer', 9));
  assert.ok(leicht < 0.7, `leicht gewinnt zu oft: ${leicht}`);
  assert.ok(schwer > leicht, `schwer ${schwer} sollte öfter gewinnen als leicht ${leicht}`);
});

// Rot täuscht einen Stoß an, bricht nach 240 ms ab und stößt sofort wirklich zu.
// Liefert, wie oft der Computer (Grün) dabei getroffen wird.
function getroffenNachFinte(durchschaut) {
  let getroffen = 0;
  for (let i = 0; i < 40; i++) {
    const computer = new Computergegner('mittel', zufall(500 + i));
    // Reaktionszeit wie ein Mensch, damit nur das Durchschauen den Unterschied macht
    computer.werte = { ...STUFEN.mittel, reaktion: 200, treffsicherheit: 1, durchschaut, angriffslust: 0 };
    const sr = fernsteuerung();
    const { rot, gruen } = zweiFechter(120, sr, computer);
    for (let t = 0; t < 1500; t += BILD) {
      if (t === 0 || t === 240 || t === 256) sr.druck.add('stoss');
      computer.denke(t, gruen, rot);
      computer.halte = { links: false, rechts: false }; // er soll stehen bleiben, nicht ausweichen
      rot.aktualisiere(t, BILD, gruen);
      gruen.aktualisiere(t, BILD, rot);
      gruen.x = Math.max(gruen.x, rot.x + 72);
      const e = rot.pruefeStoss(gruen);
      if (e === 'pariert') break;
      if (e === 'treffer') {
        getroffen++;
        break;
      }
    }
  }
  return getroffen / 40;
}

test('wer Finten durchschaut, wehrt den echten Stoß danach ab – wer nicht, wird getroffen', () => {
  const ohne = getroffenNachFinte(0);
  const mit = getroffenNachFinte(1);
  // Ohne Durchschauen rettet ihn nur, wenn er zufällig mit einem Tiefstoß unter dem echten Stoß wegtaucht
  assert.ok(ohne > 0.6, `ohne Durchschauen nur ${ohne} getroffen`);
  assert.ok(mit < 0.2, `mit Durchschauen trotzdem ${mit} getroffen`);
});

test('der Computer wehrt eine Flèche ab, wenn er richtig antwortet', () => {
  let abgewehrt = 0;
  for (let i = 0; i < 40; i++) {
    const computer = new Computergegner('mittel', zufall(900 + i));
    computer.werte = { ...STUFEN.mittel, treffsicherheit: 1, angriffslust: 0 };
    const sr = fernsteuerung();
    const { rot, gruen } = zweiFechter(250, sr, computer);
    sr.druck.add('fleche');
    for (let t = 0; t < 2000; t += BILD) {
      computer.denke(t, gruen, rot);
      computer.halte = { links: false, rechts: false };
      rot.aktualisiere(t, BILD, gruen);
      gruen.aktualisiere(t, BILD, rot);
      gruen.x = Math.max(gruen.x, rot.x + 72);
      const e = rot.pruefeStoss(gruen);
      if (e === 'treffer') break;
      // abgewehrt: pariert oder mit dem Tiefstoß darunter durch getroffen
      if (e === 'pariert' || gruen.pruefeStoss(rot) === 'treffer') {
        abgewehrt++;
        break;
      }
    }
  }
  assert.ok(abgewehrt / 40 > 0.9, `nur ${abgewehrt} von 40 abgewehrt`);
});
