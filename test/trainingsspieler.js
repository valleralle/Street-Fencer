// Test-Spieler für das Training: zu jeder Lektion ein Spieler, der sie zügig und mit menschlicher
// Reaktionszeit (220 ms) erfüllt – daraus sind die Medaillengrenzen abgeleitet (Issue #24)
import Trainer from '../src/Trainer.js';
import { LEKTIONEN } from '../src/lektionen.js';
import { zweiFechter, fernsteuerung, BILD, ENDLINIEN } from './hilfen.js';
import { halteAbstand } from '../src/abstand.js';

export const REAKTION = 220;

// Reagiert REAKTION ms nach dem Ausholen des Trainers mit einer Aktion
const reagiertMit = (aktion) => {
  let ausholenSeit = null;
  return (t, sr, ich, trainer) => {
    if (trainer.aktion === 'stoss' && ausholenSeit === null) ausholenSeit = t;
    if (ausholenSeit !== null && t - ausholenSeit >= REAKTION && t - ausholenSeit < REAKTION + BILD) sr.druck.add(aktion);
  };
};

export const SPIELER = {
  bewegen: () => (t, sr) => (sr.halte = t < 500 ? { rechts: true } : { links: true }),
  stoss: () => (t, sr, ich, trainer) => {
    if (trainer.x - ich.x > 120) sr.halte = { rechts: true };
    else if (!ich.aktion) sr.druck.add('stoss');
  },
  ausfall: () => (t, sr) => {
    sr.halte = { rechts: true };
    if (t === 0) sr.druck.add('stoss');
  },
  parade: () => reagiertMit('parade'),
  riposte: () => {
    const parade = reagiertMit('parade');
    return (t, sr, ich, trainer) => {
      parade(t, sr, ich, trainer);
      if (ich.kannRiposte) sr.druck.add('stoss');
    };
  },
  finte: () => (t, sr) => {
    if ([0, 128, 240].includes(t)) sr.druck.add('stoss');
  },
  tiefstoss: () => reagiertMit('tiefstoss'),
  fleche: () => (t, sr) => {
    if (t === 0) sr.druck.add('fleche');
  },
};

// Spielt eine Lektion mit ihrem Test-Spieler; liefert die Zeit bis zum Erfolg in ms (null: nicht geschafft)
export function lektionsZeit(id, spieler = SPIELER[id]()) {
  const lektion = LEKTIONEN.find((l) => l.id === id);
  const sr = fernsteuerung();
  const trainer = new Trainer(lektion.trainer);
  trainer.naechsterAngriff = 1200; // wie in der TrainingSzene
  const { rot, gruen } = zweiFechter(lektion.abstand, sr, trainer);
  let strecke = 0;
  for (let t = 0; t < 10_000; t += BILD) {
    sr.halte = {};
    spieler(t, sr, rot, gruen);
    trainer.denke(t, gruen, rot);
    const vorher = [rot.x, gruen.x];
    rot.aktualisiere(t, BILD, gruen);
    gruen.aktualisiere(t, BILD, rot);
    halteAbstand(rot, gruen, ...vorher, ENDLINIEN);
    strecke += Math.abs(rot.x - vorher[0]);
    const ereignisse = [{ art: 'bewegt', strecke }];
    for (const [a, b] of [[rot, gruen], [gruen, rot]]) {
      const e = a.pruefeStoss(b);
      if (e === 'pariert') {
        a.wurdePariert();
        b.paradeGelungen();
        ereignisse.push({ art: 'parade', farbe: b.name });
      } else if (e === 'treffer') ereignisse.push({ art: 'treffer', farbe: a.name, aktion: a.aktion, nachFinte: a.nachFinte });
    }
    if (ereignisse.some((e) => lektion.ziel(e))) return t;
    if (ereignisse.some((e) => e.art === 'treffer')) return null;
  }
  return null;
}
