// Spielweisen, Doppeltreffer-Taktik und Charakter des Computergegners (Issue #13)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Computergegner, { CHARAKTERE } from '../src/Computergegner.js';
import Gefecht from '../src/Gefecht.js';
import { halteAbstand } from '../src/abstand.js';
import { zweiFechter, zufall, BILD, ENDLINIEN, passiverSpieler } from './hilfen.js';
import { spammer } from './spammer.js';

const STUFEN = ['leicht', 'mittel', 'schwer'];

// 20 Sekunden gegen einen Spieler, der stillsteht: Angriffe pro Minute und Anteil der Zeit,
// in der der Computer abwartet oder zurückweicht
function gegenStillstehenden(stufe, charakter, startwert) {
  const computer = new Computergegner(stufe, zufall(startwert), charakter);
  computer.kenneGefecht(new Gefecht(), 'gruen');
  const { rot, gruen } = zweiFechter(256, passiverSpieler(), computer);
  let angriffe = 0;
  let defensiv = 0;
  let bilder = 0;
  let vorher = null;
  for (let t = BILD; t < 20_000; t += BILD) {
    computer.denke(t, gruen, rot);
    const x = [rot.x, gruen.x];
    rot.aktualisiere(t, BILD, gruen);
    gruen.aktualisiere(t, BILD, rot);
    halteAbstand(rot, gruen, ...x, ENDLINIEN);
    if (gruen.aktion && gruen.aktion !== 'parade' && gruen.aktion !== vorher) angriffe++;
    vorher = gruen.aktion;
    if (computer.halte.rechts || computer.spielweise !== 'angreifen') defensiv++;
    bilder++;
    if (rot.pruefeStoss(gruen) || gruen.pruefeStoss(rot)) {
      rot.zuruecksetzen();
      gruen.zuruecksetzen();
    }
  }
  return { proMinute: angriffe * 3, defensiv: defensiv / bilder };
}

function mittelwert(stufe, charakter) {
  let proMinute = 0;
  let defensiv = 0;
  for (let i = 0; i < 10; i++) {
    const r = gegenStillstehenden(stufe, charakter, 50 + i);
    proMinute += r.proMinute / 10;
    defensiv += r.defensiv / 10;
  }
  return { proMinute, defensiv };
}

test('der Computer wartet auch ab oder weicht zurück – nicht nur 1–2 % der Zeit wie früher', () => {
  for (const stufe of STUFEN) {
    const anteile = Object.keys(CHARAKTERE).map((c) => mittelwert(stufe, c).defensiv);
    const schnitt = anteile.reduce((a, b) => a + b) / anteile.length;
    // Auch der Angreifer auf Leicht (greift laut Issue #13 eher planlos an) wartet manchmal ab
    assert.ok(Math.min(...anteile) > 0.03, `${stufe}: ${anteile}`);
    assert.ok(schnitt > 0.1, `${stufe}: im Schnitt nur ${schnitt}`);
  }
});

test('die Charaktere unterscheiden sich: der Angreifer greift am meisten an, der Konterfechter am wenigsten', () => {
  for (const stufe of STUFEN) {
    const a = mittelwert(stufe, 'angreifer').proMinute;
    const t = mittelwert(stufe, 'taktiker').proMinute;
    const k = mittelwert(stufe, 'konterfechter').proMinute;
    assert.ok(a > t && t > k, `${stufe}: Angreifer ${a}, Taktiker ${t}, Konterfechter ${k}`);
  }
});

test('ohne Angabe bekommt jeder Gegner einen Charakter mit Namen', () => {
  const computer = new Computergegner('mittel', zufall(3));
  assert.ok(CHARAKTERE[computer.charakter]);
  assert.match(computer.charakterName, /^(Angreifer|Konterfechter|Taktiker)$/);
});

// Anteil der Doppeltreffer am ersten Treffer eines Gefechtsabschnitts, gegen einen Spieler,
// der angreift, sobald er nah genug ist. stand = [Rot, Grün]; Grün ist der Computer.
function doppeltrefferAnteil(stufe, stand, verlaengerung = false) {
  let doppel = 0;
  let alle = 0;
  for (let i = 0; i < 300; i++) {
    const computer = new Computergegner(stufe, zufall(900 + i));
    const gefecht = new Gefecht();
    gefecht.stand = { rot: stand[0], gruen: stand[1] };
    gefecht.verlaengerung = verlaengerung;
    computer.kenneGefecht(gefecht, 'gruen');
    const spieler = spammer('stoss', 125);
    const { rot, gruen } = zweiFechter(256, spieler, computer);
    let erster = null;
    const treffer = { rot: false, gruen: false };
    for (let t = BILD; t < 20_000; t += BILD) {
      if (erster === null) {
        spieler.denke(t, rot, gruen);
        computer.denke(t, gruen, rot);
      }
      const x = [rot.x, gruen.x];
      rot.aktualisiere(t, BILD, gruen, erster === null);
      gruen.aktualisiere(t, BILD, rot, erster === null);
      halteAbstand(rot, gruen, ...x, ENDLINIEN);
      for (const [a, b, farbe] of [[rot, gruen, 'rot'], [gruen, rot, 'gruen']]) {
        const e = a.pruefeStoss(b);
        if (e === 'pariert') {
          a.wurdePariert();
          b.paradeGelungen();
        }
        if (e === 'treffer') {
          treffer[farbe] = true;
          erster ??= t;
        }
      }
      if (erster !== null && t - erster >= 100) break;
    }
    if (treffer.rot && treffer.gruen) doppel++;
    if (treffer.rot || treffer.gruen) alle++;
  }
  return doppel / alle;
}

test('in Führung spielt der Computer auf Doppeltreffer – mittel und schwer deutlich öfter als bei Gleichstand', () => {
  for (const stufe of ['mittel', 'schwer']) {
    const vorne = doppeltrefferAnteil(stufe, [1, 3]);
    const gleich = doppeltrefferAnteil(stufe, [2, 2]);
    assert.ok(vorne > gleich + 0.05, `${stufe}: vorne ${vorne}, Gleichstand ${gleich}`);
  }
});

test('bei 4:4 und in der Verlängerung (Doppeltreffer gestrichen) spielt er nicht auf Doppeltreffer', () => {
  for (const stufe of STUFEN) {
    const gleich = doppeltrefferAnteil(stufe, [2, 2]);
    assert.ok(doppeltrefferAnteil(stufe, [4, 4]) <= gleich + 0.02, `${stufe}: 4:4`);
    assert.ok(doppeltrefferAnteil(stufe, [2, 3], true) <= gleich + 0.02, `${stufe}: Verlängerung`);
  }
});

test('die Taktik „gleichzeitig“ wählt er nur in Führung und nie, wenn ein Doppeltreffer gestrichen würde', () => {
  const faelle = [
    { stand: [1, 3], erlaubt: true },
    { stand: [2, 2], erlaubt: false },
    { stand: [3, 1], erlaubt: false },
    { stand: [4, 4], erlaubt: false },
    { stand: [2, 3], verlaengerung: true, erlaubt: false },
  ];
  for (const { stand, verlaengerung = false, erlaubt } of faelle) {
    let gewaehlt = 0;
    for (let i = 0; i < 200; i++) {
      const computer = new Computergegner('schwer', zufall(i));
      const gefecht = new Gefecht();
      gefecht.stand = { rot: stand[0], gruen: stand[1] };
      gefecht.verlaengerung = verlaengerung;
      computer.kenneGefecht(gefecht, 'gruen');
      if (computer.waehleSpielweise() === 'gleichzeitig') gewaehlt++;
    }
    if (erlaubt) assert.ok(gewaehlt > 40, `${stand}: nur ${gewaehlt} von 200`);
    else assert.equal(gewaehlt, 0, `${stand.join(':')}${verlaengerung ? ' Verlängerung' : ''}`);
  }
});

test('Schwer wählt die Spielweise nach dem Stand, Leicht kaum: im Rückstand greift Schwer öfter an', () => {
  const angriffsanteil = (stufe, stand) => {
    let angreifen = 0;
    for (let i = 0; i < 300; i++) {
      const computer = new Computergegner(stufe, zufall(i), 'taktiker');
      const gefecht = new Gefecht();
      gefecht.stand = { rot: stand[0], gruen: stand[1] };
      computer.kenneGefecht(gefecht, 'gruen');
      if (computer.waehleSpielweise() === 'angreifen') angreifen++;
    }
    return angreifen / 300;
  };
  const schwer = angriffsanteil('schwer', [3, 1]) - angriffsanteil('schwer', [2, 2]);
  const leicht = angriffsanteil('leicht', [3, 1]) - angriffsanteil('leicht', [2, 2]);
  assert.ok(schwer > 0.3, `Schwer im Rückstand nur ${schwer} öfter`);
  assert.ok(leicht < schwer / 2, `Leicht ${leicht} reagiert fast so stark wie Schwer ${schwer}`);
});
