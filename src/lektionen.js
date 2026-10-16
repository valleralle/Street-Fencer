// Die Lektionen des Trainings. Der Spieler ficht als Rot gegen den Trainer (Grün).
//   text(t)  – Anleitung; t = Tastennamen des Spielers (z. B. t.stoss = 'F')
//   trainer  – 'stehen' oder 'angreifen' (siehe Trainer.js)
//   abstand  – Abstand der Fechter zu Beginn
//   ziel(e)  – true, wenn das Ereignis e die Lektion erfüllt
//   tipp     – Hinweis, wenn man mit einer anderen Aktion trifft
// Ereignisse: { art: 'bewegt', strecke }, { art: 'parade', farbe }, { art: 'treffer', farbe, aktion }
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
    text: (t) => `Aus größerer Entfernung: ${t.rechts} halten und dabei ${t.stoss} drücken.`,
    trainer: 'stehen',
    abstand: 200,
    ziel: trifftMit('ausfall'),
    tipp: 'Halte beim Stoß gleichzeitig vorwärts gedrückt.',
  },
  {
    titel: 'Parade',
    text: (t) => `Der Trainer greift an. Drücke ${t.parade}, sobald er ausholt.`,
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
    titel: 'Tiefstoß',
    text: (t) => `Tauche mit ${t.tiefstoss} unter dem Stoß des Trainers weg.`,
    trainer: 'angreifen',
    abstand: 180,
    ziel: trifftMit('tiefstoss'),
    tipp: 'Warte, bis er ausholt, und tauche dann ab.',
  },
  {
    titel: 'Flèche',
    text: (t) => `Sturmangriff aus der Distanz: drücke ${t.fleche}.`,
    trainer: 'stehen',
    abstand: 300,
    ziel: trifftMit('fleche'),
    tipp: 'Für die Flèche brauchst du Anlauf – geh erst etwas zurück.',
  },
];
