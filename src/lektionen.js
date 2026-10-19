// Die Lektionen des Trainings. Der Spieler ficht als Rot gegen den Trainer (Grün).
//   titel, text(t), tipp – aus dem Wörterbuch; t = Bedienung des Spielers (siehe bedienung)
//   trainer  – 'stehen' oder 'angreifen' (siehe Trainer.js)
//   abstand  – Abstand der Fechter zu Beginn
//   ziel(e)  – true, wenn das Ereignis e die Lektion erfüllt
//   tipp     – Hinweis, wenn man mit einer anderen Aktion trifft (nicht jede Lektion hat einen)
// Ereignisse: { art: 'bewegt', strecke }, { art: 'parade', farbe }, { art: 'treffer', farbe, aktion, nachFinte }
import { knopfText } from './touch.js';
import { text, WOERTERBUECHER } from './texte.js';

// Namen und Verben für die Anleitungen: an der Tastatur die Tasten (tasten = { stoss: 'F', … }),
// auf dem Handy die Knöpfe am Bildschirm – jeweils in der eingestellten Sprache
export function bedienung(tasten, touch = false) {
  const verben = (art) => ({
    druecke: text(`bedienung.${art}`),
    Druecke: text(`bedienung.${art[0].toUpperCase()}${art.slice(1)}`),
    druecken: text(`bedienung.${art}n`),
  });
  if (!touch) return { ...tasten, ...verben('druecke') };
  const knopf = (name) => (['links', 'rechts'].includes(name) ? knopfText(name) : text('zitat', { text: knopfText(name) }));
  const namen = Object.fromEntries(['links', 'rechts', 'stoss', 'parade', 'tiefstoss', 'fleche'].map((n) => [n, knopf(n)]));
  return { ...namen, ...verben('tippe') };
}

// Eine Lektion: Titel, Anleitung und Tipp kommen aus dem Wörterbuch (texte.js, Schlüssel lektion.<id>.…)
function lektion(id, eigenschaften) {
  return {
    id,
    get titel() {
      return text(`lektion.${id}.titel`);
    },
    text: (t) => text(`lektion.${id}.text`, t),
    get tipp() {
      const schluessel = `lektion.${id}.tipp`;
      return schluessel in WOERTERBUECHER.de ? text(schluessel) : undefined;
    },
    ...eigenschaften,
  };
}

const trifftMit = (aktion) => (e) => e.art === 'treffer' && e.farbe === 'rot' && e.aktion === aktion;

export const LEKTIONEN = [
  lektion('bewegen', {
    trainer: 'stehen',
    abstand: 256,
    ziel: (e) => e.art === 'bewegt' && e.strecke >= 200,
  }),
  lektion('stoss', {
    trainer: 'stehen',
    abstand: 256,
    ziel: trifftMit('stoss'),
  }),
  lektion('ausfall', {
    trainer: 'stehen',
    abstand: 200,
    ziel: trifftMit('ausfall'),
  }),
  lektion('parade', {
    trainer: 'angreifen',
    abstand: 180,
    ziel: (e) => e.art === 'parade' && e.farbe === 'rot',
  }),
  lektion('riposte', {
    trainer: 'angreifen',
    abstand: 180,
    ziel: trifftMit('riposte'),
  }),
  lektion('finte', {
    trainer: 'pariert',
    abstand: 120,
    ziel: (e) => e.art === 'treffer' && e.farbe === 'rot' && e.nachFinte,
  }),
  lektion('tiefstoss', {
    trainer: 'angreifen',
    abstand: 180,
    ziel: trifftMit('tiefstoss'),
  }),
  lektion('fleche', {
    trainer: 'stehen',
    abstand: 240,
    ziel: trifftMit('fleche'),
  }),
];
