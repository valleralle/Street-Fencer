import { BODEN_Y } from './Fechter.js';

// Positionen entlang der Mittellinie der Fechtbahn (Bildschirm-x)
export const ENDLINIE_LINKS = 40;
export const ENDLINIE_RECHTS = 920;
export const STARTLINIE_ROT = 352;
export const STARTLINIE_GRUEN = 608;
const MITTE = 480;
const WARNZONE = 128; // 2 Meter vor jeder Endlinie
const UEBERSTAND = 24; // die Fechtbahn reicht etwas über die Endlinien hinaus

// Die Fechtbahn wird leicht von oben gesehen: TIEFE ist der Abstand von der
// Mittellinie bis zur vorderen bzw. hinteren Kante, FLUCHT macht die hintere Kante etwas kürzer.
const TIEFE = 30;
const FLUCHT = 0.03;
const PODEST = 24; // Höhe der sichtbaren Vorderseite des Podests
const HALLE_UEBERSTAND = 480; // so weit reicht die Halle über das Bild hinaus

const P = 2; // ein Bildpixel
const raster = (v) => Math.round(v / P) * P;
// Bildschirm-x eines Punkts der Fechtbahn: u = Stelle entlang der Mittellinie, t = -1 (hinten) bis 1 (vorn)
const bahnX = (u, t) => MITTE + (u - MITTE) * (1 + FLUCHT * t);

const FARBEN = {
  wand: 0x1a1f2a,
  wandFuge: 0x161a23,
  sockel: 0x12151d,
  boden: 0x14181f,
  bodenFuge: 0x11141a,
  licht: 0xffffff,
  bahn: 0x7d8697,
  bahnStreifen: 0x858e9e,
  bahnKanteHinten: 0xa4acba,
  bahnKanteVorn: 0xb5bdca,
  warnzone: 0x9a5a4c,
  warnzoneStreifen: 0xa3624f,
  linie: 0xe8ecf2,
  podest: 0x343b49,
  podestUnten: 0x262b36,
  podestSchatten: 0x0d1016,
};

export function zeichneHalle(szene) {
  const g = szene.add.graphics();
  const hinten = BODEN_Y - TIEFE;
  const vorn = BODEN_Y + TIEFE;

  // Hallenwand mit Fugen, Sockel und Hallenboden – nach links, rechts und oben weit über das
  // 960 × 540 große Bild hinaus, damit auch breite Handybildschirme gefüllt sind (siehe bildschirm.js)
  const [links, breite, oben] = [-HALLE_UEBERSTAND, 960 + 2 * HALLE_UEBERSTAND, -HALLE_UEBERSTAND];
  g.fillStyle(FARBEN.wand).fillRect(links, oben, breite, hinten - oben);
  g.fillStyle(FARBEN.wandFuge);
  for (let y = 60 - 60 * Math.floor(HALLE_UEBERSTAND / 60); y < hinten - 20; y += 60) g.fillRect(links, y, breite, P);
  g.fillStyle(FARBEN.sockel).fillRect(links, hinten - 20, breite, 20);
  g.fillStyle(FARBEN.boden).fillRect(links, hinten, breite, 540 - hinten);
  g.fillStyle(FARBEN.bodenFuge);
  for (let y = vorn + PODEST + 16; y < 540; y += 16) g.fillRect(links, y, breite, P);

  // Lichtkegel von oben: drei übereinanderliegende Schichten, innen am hellsten
  for (const [breite, deckkraft] of [[1, 0.035], [0.72, 0.035], [0.45, 0.04]]) {
    g.fillStyle(FARBEN.licht, deckkraft);
    for (let y = 0; y < vorn; y += P) {
      const halb = raster((70 + (y / vorn) * 420) * breite);
      g.fillRect(MITTE - halb, y, halb * 2, P);
    }
  }

  // Schatten des Podests auf dem Boden und seine Vorderseite
  const vornLinks = raster(bahnX(ENDLINIE_LINKS - UEBERSTAND, 1));
  const vornRechts = raster(bahnX(ENDLINIE_RECHTS + UEBERSTAND, 1));
  g.fillStyle(FARBEN.podestSchatten).fillRect(vornLinks + 6, vorn + PODEST, vornRechts - vornLinks, 8);
  g.fillStyle(FARBEN.podest).fillRect(vornLinks, vorn, vornRechts - vornLinks, PODEST);
  g.fillStyle(FARBEN.podestUnten).fillRect(vornLinks, vorn + PODEST - 6, vornRechts - vornLinks, 6);

  // Oberfläche der Fechtbahn, Zeile für Zeile von hinten nach vorn
  for (let y = hinten; y < vorn; y += P) {
    const t = (y + P / 2 - BODEN_Y) / TIEFE;
    const zeile = (Math.round((y - hinten) / P) % 3) === 0;
    const streifen = (u0, u1, farbe) => {
      const x0 = raster(bahnX(u0, t));
      g.fillStyle(farbe).fillRect(x0, y, raster(bahnX(u1, t)) - x0, P);
    };

    let bahnFarbe = zeile ? FARBEN.bahnStreifen : FARBEN.bahn;
    if (y === hinten) bahnFarbe = FARBEN.bahnKanteHinten;
    if (y === vorn - P) bahnFarbe = FARBEN.bahnKanteVorn;
    streifen(ENDLINIE_LINKS - UEBERSTAND, ENDLINIE_RECHTS + UEBERSTAND, bahnFarbe);

    if (y !== hinten && y !== vorn - P) {
      const warn = zeile ? FARBEN.warnzoneStreifen : FARBEN.warnzone;
      streifen(ENDLINIE_LINKS, ENDLINIE_LINKS + WARNZONE, warn);
      streifen(ENDLINIE_RECHTS - WARNZONE, ENDLINIE_RECHTS, warn);
    }

    // Querlinien: Endlinien, Startlinien und Mittellinie
    g.fillStyle(FARBEN.linie);
    for (const u of [ENDLINIE_LINKS, STARTLINIE_ROT, MITTE, STARTLINIE_GRUEN, ENDLINIE_RECHTS]) {
      g.fillRect(raster(bahnX(u, t)) - P, y, P * 2, P);
    }
  }
}
