// Balance der Flèche gegen den Computer (Issue #10): Wer stur nur Flèchen macht, darf nicht deutlich
// besser abschneiden als jemand, der stur nur Stöße macht. Gemessen über ganze Gefechte mit festem Zufall.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Computergegner from '../src/Computergegner.js';
import { ganzesGefecht, zufall } from './hilfen.js';
import { spammer } from './spammer.js';

const GEFECHTE = 100;
const SPIELWEISEN = {
  'Flèche aus der Distanz': () => spammer('fleche', 250),
  'Flèche aus der Nähe': () => spammer('fleche', 140),
  'Stoß': () => spammer('stoss', 125),
};

// Anteil der Gefechte, die der Spieler (Rot) gegen die Stufe gewinnt
function siegquote(spielweise, stufe) {
  let siege = 0;
  for (let i = 0; i < GEFECHTE; i++) {
    const g = ganzesGefecht(SPIELWEISEN[spielweise](), new Computergegner(stufe, zufall(7000 + i)), i + 1);
    if (g.sieger === 'rot') siege++;
  }
  return siege / GEFECHTE;
}

const quoten = {};
for (const stufe of ['leicht', 'mittel', 'schwer']) {
  quoten[stufe] = Object.fromEntries(Object.keys(SPIELWEISEN).map((w) => [w, siegquote(w, stufe)]));
}

test('stur nur Flèchen ist gegen keine Stufe deutlich besser als stur nur Stöße', () => {
  for (const [stufe, q] of Object.entries(quoten)) {
    for (const w of ['Flèche aus der Distanz', 'Flèche aus der Nähe']) {
      assert.ok(q[w] <= q['Stoß'] + 0.15, `${stufe}: ${w} ${q[w]} gegen Stoß ${q['Stoß']}`);
    }
  }
});

test('gegen jede sture Spielweise ist „schwer“ am stärksten und „leicht“ am schwächsten', () => {
  for (const w of Object.keys(SPIELWEISEN)) {
    const { leicht, mittel, schwer } = Object.fromEntries(Object.entries(quoten).map(([s, q]) => [s, q[w]]));
    assert.ok(leicht >= mittel && mittel >= schwer, `${w}: leicht ${leicht}, mittel ${mittel}, schwer ${schwer}`);
  }
});
