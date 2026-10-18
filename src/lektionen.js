// Die Lektionen des Trainings. Der Spieler ficht als Rot gegen den Trainer (Grün).
//   text(t)  – Anleitung; t = Bedienung des Spielers (siehe bedienung: t.stoss = 'F' bzw. „Stoß“)
//   trainer  – 'stehen' oder 'angreifen' (siehe Trainer.js)
//   abstand  – Abstand der Fechter zu Beginn
//   ziel(e)  – true, wenn das Ereignis e die Lektion erfüllt
//   tipp     – Hinweis, wenn man mit einer anderen Aktion trifft
// Ereignisse: { art: 'bewegt', strecke }, { art: 'parade', farbe }, { art: 'treffer', farbe, aktion, nachFinte }
import { knopfText } from './touch.js';

// Namen und Verben für die Anleitungen: an der Tastatur die Tasten (tasten = { stoss: 'F', … }),
// auf dem Handy die Knöpfe am Bildschirm
export function bedienung(tasten, touch = false) {
  if (!touch) return { ...tasten, druecke: 'drücke', Druecke: 'Drücke', druecken: 'drücken' };
  const knopf = (name) => (['links', 'rechts'].includes(name) ? knopfText(name) : `„${knopfText(name)}“`);
  const namen = Object.fromEntries(['links', 'rechts', 'stoss', 'parade', 'tiefstoss', 'fleche'].map((n) => [n, knopf(n)]));
  return { ...namen, druecke: 'tippe', Druecke: 'Tippe', druecken: 'tippen' };
}

const trifftMit = (aktion) => (e) => e.art === 'treffer' && e.farbe === 'rot' && e.aktion === aktion;

export const LEKTIONEN = [
  {
    titel: 'Bewegen',
    text: (t) => `Gehe mit ${t.rechts} vor und mit ${t.links} zurück.`,
    trainer: 'stehen',
    abstand: 256,
    ziel: (e) => e.art === 'bewegt' && e.strecke >= 200,
  },
  {
    titel: 'Stoß',
    text: (t) => `Gehe nah heran und stoße mit ${t.stoss}.`,
    trainer: 'stehen',
    abstand: 256,
    ziel: trifftMit('stoss'),
    tipp: 'Diesmal nur ein einfacher Stoß – ohne vorwärts zu drücken.',
  },
  {
    titel: 'Ausfall',
    text: (t) => `Aus größerer Entfernung: ${t.rechts} halten und dabei ${t.stoss} ${t.druecken}.`,
    trainer: 'stehen',
    abstand: 200,
    ziel: trifftMit('ausfall'),
    tipp: 'Halte beim Stoß gleichzeitig vorwärts gedrückt.',
  },
  {
    titel: 'Parade',
    text: (t) => `Der Trainer greift an. ${t.Druecke} ${t.parade}, sobald er ausholt.`,
    trainer: 'angreifen',
    abstand: 180,
    ziel: (e) => e.art === 'parade' && e.farbe === 'rot',
  },
  {
    titel: 'Riposte',
    text: (t) => `Pariere mit ${t.parade} und stoße direkt danach mit ${t.stoss} zurück.`,
    trainer: 'angreifen',
    abstand: 180,
    ziel: trifftMit('riposte'),
    tipp: 'Stoße gleich nach der gelungenen Parade.',
  },
  {
    titel: 'Finte',
    text: (t) =>
      `Der Trainer pariert jeden Angriff. Täusche ihn: ${t.druecke} ${t.stoss} dreimal im Rhythmus – ausholen, abbrechen, zustoßen.`,
    trainer: 'pariert',
    abstand: 120,
    ziel: (e) => e.art === 'treffer' && e.farbe === 'rot' && e.nachFinte,
    tipp: 'Nicht zu schnell: der echte Stoß muss nach seiner Parade kommen.',
  },
  {
    titel: 'Tiefstoß',
    text: (t) => `Tauche mit ${t.tiefstoss} unter dem Stoß des Trainers weg.`,
    trainer: 'angreifen',
    abstand: 180,
    ziel: trifftMit('tiefstoss'),
    tipp: 'Warte, bis er ausholt, und tauche dann ab.',
  },
  {
    titel: 'Flèche',
    text: (t) => `Sturmangriff aus der Distanz: ${t.druecke} ${t.fleche}.`,
    trainer: 'stehen',
    abstand: 240,
    ziel: trifftMit('fleche'),
    tipp: 'Für die Flèche brauchst du Anlauf – geh erst etwas zurück.',
  },
];
