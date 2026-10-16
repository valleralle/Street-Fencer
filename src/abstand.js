import { BREITE } from './Fechter.js';

// Kleinster Abstand der Körpermitten: so weit, dass sich die vorderen Füße gerade nicht berühren.
// Stoß (bis 131) und Tiefstoß (bis 121) reichen weiter, treffen also weiterhin.
export const MIN_ABSTAND = 72;

// Die Fechter berühren sich nicht und kommen nicht über die Endlinien. Wer zu nah herankommt,
// bleibt stehen (auch Ausfall und Flèche bremsen ab) – der Gegner wird dabei nicht weggeschoben.
// vorherRot/vorherGruen = Positionen vor diesem Bild; links/rechts = Endlinien
export function halteAbstand(rot, gruen, vorherRot, vorherGruen, { links, rechts }) {
  const zuNah = MIN_ABSTAND - (gruen.x - rot.x);
  if (zuNah > 0) {
    // Zurückgesetzt wird, wer sich in diesem Bild nach vorn bewegt hat – laufen beide, anteilig
    const vorRot = Math.max(0, rot.x - vorherRot);
    const vorGruen = Math.max(0, vorherGruen - gruen.x);
    const anteilRot = vorRot + vorGruen > 0 ? vorRot / (vorRot + vorGruen) : 0.5;
    rot.x -= zuNah * anteilRot;
    gruen.x += zuNah * (1 - anteilRot);
  }
  rot.x = Math.min(Math.max(rot.x, links + BREITE / 2), rechts - BREITE / 2 - MIN_ABSTAND);
  gruen.x = Math.min(Math.max(gruen.x, rot.x + MIN_ABSTAND), rechts - BREITE / 2);
}
