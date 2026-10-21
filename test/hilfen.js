// Gemeinsame Hilfen für die Tests: Fechter ohne Grafik, eine Steuerung zum Fernbedienen
// und ein Zufallsgenerator mit festem Startwert, damit Tests immer gleich ausgehen.
import Fechter from '../src/Fechter.js';
import Gefecht from '../src/Gefecht.js';
import { halteAbstand } from '../src/abstand.js';

export const BILD = 16; // ms pro Bild (etwa 60 Bilder pro Sekunde)
export const ENDLINIEN = { links: 40, rechts: 920 };

// Steuerung, bei der der Test Tasten drückt (einmalig) oder hält
export function fernsteuerung() {
  const s = {
    halte: {},
    druck: new Set(),
    gehalten: (name) => !!s.halte[name],
    gedrueckt: (name) => s.druck.delete(name),
  };
  return s;
}

export function zweiFechter(abstand, steuerungRot = fernsteuerung(), steuerungGruen = fernsteuerung()) {
  const rot = new Fechter(null, { x: 400, richtung: 1, name: 'rot', steuerung: steuerungRot });
  const gruen = new Fechter(null, { x: 400 + abstand, richtung: -1, name: 'gruen', steuerung: steuerungGruen });
  return { rot, gruen };
}

// Zufall mit Startwert (mulberry32)
export function zufall(startwert) {
  let a = startwert >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Drückt die Taste(n) für eine Aktion; Ausfall und Flèche brauchen dazu „vorwärts“
function druecke(steuerung, fechter, aktion) {
  const vor = fechter.richtung > 0 ? 'rechts' : 'links';
  if (aktion === 'ausfall') {
    steuerung.halte[vor] = true;
    steuerung.druck.add('stoss');
  } else steuerung.druck.add(aktion);
}

// Ein Schlagabtausch: Rot macht aktionRot zur Zeit zeitRot, Grün aktionGruen zur Zeit zeitGruen.
// Für mehrere Aktionen nacheinander: folgeRot / folgeGruen = [[zeit, aktion], …] (z. B. für Finten).
// Nach einer gelungenen Parade ripostiert der Parierende sofort. Liefert die Ereignisse als Text,
// z. B. ['rot pariert', 'gruen trifft'] – nach dem ersten Treffer wird noch das Doppeltreffer-Fenster abgewartet.
export function schlagabtausch({ abstand, aktionRot, zeitRot = 0, aktionGruen, zeitGruen = 0, folgeRot, folgeGruen }) {
  folgeRot ??= aktionRot ? [[zeitRot, aktionRot]] : [];
  folgeGruen ??= aktionGruen ? [[zeitGruen, aktionGruen]] : [];
  const sr = fernsteuerung();
  const sg = fernsteuerung();
  const { rot, gruen } = zweiFechter(abstand, sr, sg);
  const ereignisse = [];
  let ersterTreffer = null;

  for (let t = 0; t < 3000; t += BILD) {
    for (const [zeit, aktion] of folgeRot) if (t >= zeit && t < zeit + BILD) druecke(sr, rot, aktion);
    for (const [zeit, aktion] of folgeGruen) if (t >= zeit && t < zeit + BILD) druecke(sg, gruen, aktion);
    const vorher = [rot.x, gruen.x];
    const eingabe = ersterTreffer === null;
    rot.aktualisiere(t, BILD, gruen, eingabe);
    gruen.aktualisiere(t, BILD, rot, eingabe);
    sr.halte = {};
    sg.halte = {};
    halteAbstand(rot, gruen, ...vorher, ENDLINIEN);

    for (const [a, b, name, sb] of [[rot, gruen, 'rot', sg], [gruen, rot, 'gruen', sr]]) {
      const e = a.pruefeStoss(b);
      if (e === 'pariert') {
        a.wurdePariert();
        b.paradeGelungen();
        ereignisse.push(`${name === 'rot' ? 'gruen' : 'rot'} pariert`); // b hat a pariert
        sb.druck.add('stoss'); // Riposte
      }
      if (e === 'treffer') {
        ereignisse.push(`${name} trifft`);
        ersterTreffer ??= t;
      }
    }
    if (ersterTreffer !== null && t - ersterTreffer >= 100) break;
  }
  return ereignisse;
}

// Ein ganzes Gefecht zwischen zwei Steuerungen (mit denke()-Methode); liefert das Gefecht am Ende.
// nachJedemBild(t, rot, gruen) läuft nach jedem Bild (z. B. für eine Aufzeichnung).
export function ganzesGefecht(steuerungRot, steuerungGruen, startwert = 1, nachJedemBild = null) {
  const { rot, gruen } = zweiFechter(256, steuerungRot, steuerungGruen);
  rot.startX = 352;
  gruen.startX = 608;
  rot.zuruecksetzen();
  gruen.zuruecksetzen();
  const g = new Gefecht(zufall(startwert));
  steuerungRot.kenneGefecht?.(g, 'rot');
  steuerungGruen.kenneGefecht?.(g, 'gruen');
  let t = 0;
  let ersterTreffer = null;
  let treffer = { rot: false, gruen: false };

  while (!g.sieger && t < 900_000) {
    t += BILD;
    if (ersterTreffer === null) {
      steuerungRot.denke?.(t, rot, gruen);
      steuerungGruen.denke?.(t, gruen, rot);
    }
    const vorher = [rot.x, gruen.x];
    rot.aktualisiere(t, BILD, gruen, ersterTreffer === null);
    gruen.aktualisiere(t, BILD, rot, ersterTreffer === null);
    halteAbstand(rot, gruen, ...vorher, ENDLINIEN);
    for (const [a, b, f] of [[rot, gruen, 'rot'], [gruen, rot, 'gruen']]) {
      const e = a.pruefeStoss(b);
      if (e === 'pariert') {
        a.wurdePariert();
        b.paradeGelungen();
      }
      if (e === 'treffer') {
        treffer[f] = true;
        ersterTreffer ??= t;
      }
    }
    nachJedemBild?.(t, rot, gruen);
    if (ersterTreffer !== null && t - ersterTreffer >= 100) {
      g.werteAus(treffer);
      treffer = { rot: false, gruen: false };
      ersterTreffer = null;
      rot.zuruecksetzen();
      gruen.zuruecksetzen();
      t += 3000;
    } else if (ersterTreffer === null) g.zeitVergeht(BILD);
  }
  return g;
}

// Spieler-Attrappen für Gefechte gegen den Computer
export const passiverSpieler = () => ({ gehalten: () => false, gedrueckt: () => false });
// Läuft stur vorwärts und stößt, sobald sein Fechter frei ist. (Während des Ausholens erneut zu
// drücken wäre eine Finte – das tut er nicht.)
export function draufgaenger() {
  let frei = false;
  return {
    denke: (t, ich) => (frei = !ich.aktion && !ich.offen),
    gehalten: (t) => t === 'rechts',
    gedrueckt: (t) => t === 'stoss' && frei,
  };
}
