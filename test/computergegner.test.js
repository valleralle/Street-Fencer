// Ganze Gefechte gegen den Computergegner – mit festem Zufall, damit das Ergebnis immer gleich ist
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Computergegner from '../src/Computergegner.js';
import { ganzesGefecht, passiverSpieler, draufgaenger, zufall } from './hilfen.js';

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
