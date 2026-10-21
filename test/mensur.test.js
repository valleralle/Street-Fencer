// Issue #22: Der Computer hält die Mensur nicht perfekt. Er sieht die Bewegung des Gegners erst nach
// seiner Reaktionszeit und zieht erst nach, wenn die Mensur mehr als seine Toleranz abweicht.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Computergegner, { STUFEN } from '../src/Computergegner.js';
import { BILD, fernsteuerung, zufall, zweiFechter } from './hilfen.js';

// Grün (Computer) will 200 px Mensur halten; Rot steht erst und folgt dann dem Fahrplan
// (fahrplan(t) = 'rechts', 'links' oder nichts). Liefert die Mensur in jedem Bild ab Rots erstem Schritt.
function mensurVerlauf(stufe, fahrplan, dauer) {
  const computer = new Computergegner(stufe, zufall(1));
  computer.werte = { ...STUFEN[stufe], angriffslust: 0 };
  computer.wunschAbstand = 200;
  computer.naechsterAbstandswechsel = Infinity;
  computer.naechsteWahl = Infinity;
  const sr = fernsteuerung();
  const { rot, gruen } = zweiFechter(200, sr, computer);
  const verlauf = [];
  const START = 1000;
  for (let t = 0; t < START + dauer; t += BILD) {
    const richtung = t >= START ? fahrplan(t - START) : null;
    sr.halte = { rechts: richtung === 'rechts', links: richtung === 'links' };
    computer.denke(t, gruen, rot);
    rot.aktualisiere(t, BILD, gruen);
    gruen.aktualisiere(t, BILD, rot);
    if (t >= START) verlauf.push(gruen.x - rot.x);
  }
  return verlauf;
}

test('geht der Gegner auf ihn zu, schrumpft die Mensur, bevor der Computer zurückweicht', () => {
  const mindestens = { leicht: 80, mittel: 50, schwer: 28 };
  for (const [stufe, schrumpf] of Object.entries(mindestens)) {
    const verlauf = mensurVerlauf(stufe, () => 'rechts', 800);
    const geschrumpft = verlauf[0] - Math.min(...verlauf);
    assert.ok(geschrumpft >= schrumpf, `${stufe}: nur ${geschrumpft.toFixed(0)} px geschrumpft`);
  }
});

test('geht der Gegner vor und zurück, schwankt die Mensur bei „leicht“ stärker als bei „schwer“', () => {
  const rhythmus = (t) => (Math.floor(t / 400) % 2 === 0 ? 'rechts' : 'links');
  const schwankung = (stufe) => {
    const verlauf = mensurVerlauf(stufe, rhythmus, 4000);
    return Math.max(...verlauf) - Math.min(...verlauf);
  };
  const leicht = schwankung('leicht');
  const schwer = schwankung('schwer');
  assert.ok(leicht > schwer, `leicht ${leicht.toFixed(0)} px, schwer ${schwer.toFixed(0)} px`);
});
