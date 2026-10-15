import { stil } from './schrift.js';

const FARBEN = { rot: 0xe03b3b, gruen: 0x2fbf4f };
const TEXTFARBEN = { rot: '#e03b3b', gruen: '#2fbf4f' };
const LAMPE_AUS = { rot: 0x4a2326, gruen: 0x1d4027 };

const MITTE = 480;
const OBEN = 40;
const BREITE = 320;
const HOEHE = 112;
const LAMPE = 40; // Kantenlänge einer Lampe
const LAMPEN_X = { rot: MITTE - 118, gruen: MITTE + 118 };
const LAMPEN_Y = OBEN + 46;

// Kasten oben in der Mitte mit Trefferanzeige (zwei Lampen), Punktestand und Uhr
export default class Meldegeraet {
  constructor(szene) {
    const g = szene.add.graphics();
    const links = MITTE - BREITE / 2;

    // Gehäuse mit heller Oberkante und dunkler Unterkante
    g.fillStyle(0x2a303c).fillRect(links, OBEN, BREITE, HOEHE);
    g.fillStyle(0x4a5263).fillRect(links, OBEN, BREITE, 2).fillRect(links, OBEN, 2, HOEHE);
    g.fillStyle(0x151a24).fillRect(links, OBEN + HOEHE - 2, BREITE, 2).fillRect(links + BREITE - 2, OBEN, 2, HOEHE);
    // Anzeigefelder für Punkte und Uhr
    g.fillStyle(0x0f1218).fillRect(MITTE - 70, OBEN + 12, 140, 60).fillRect(MITTE - 50, OBEN + 78, 100, 24);
    // Fassungen der Lampen
    g.fillStyle(0x151a24);
    for (const x of Object.values(LAMPEN_X)) g.fillRect(x - LAMPE / 2 - 4, LAMPEN_Y - LAMPE / 2 - 4, LAMPE + 8, LAMPE + 8);

    this.lampen = { rot: szene.add.graphics(), gruen: szene.add.graphics() };
    this.punkteRot = szene.add.text(MITTE - 12, OBEN + 42, '0', stil(48, TEXTFARBEN.rot)).setOrigin(1, 0.5);
    const doppelpunkt = szene.add.text(MITTE, OBEN + 42, ':', stil(48)).setOrigin(0.5);
    this.punkteGruen = szene.add.text(MITTE + 12, OBEN + 42, '0', stil(48, TEXTFARBEN.gruen)).setOrigin(0, 0.5);
    this.uhr = szene.add.text(MITTE, OBEN + 90, '', stil(20, '#ffd166')).setOrigin(0.5);

    // Alle Teile, damit die Kamera sie fest am Bildschirm halten kann
    this.objekte = [g, this.lampen.rot, this.lampen.gruen, this.punkteRot, doppelpunkt, this.punkteGruen, this.uhr];

    this.schalteLampe('rot', false);
    this.schalteLampe('gruen', false);
  }

  zeige(stand, uhrzeit) {
    this.punkteRot.setText(String(stand.rot));
    this.punkteGruen.setText(String(stand.gruen));
    this.uhr.setText(uhrzeit);
  }

  schalteLampe(farbe, an) {
    const g = this.lampen[farbe];
    const x = LAMPEN_X[farbe] - LAMPE / 2;
    const y = LAMPEN_Y - LAMPE / 2;
    g.clear();
    if (an) {
      // Lichtschein um die Lampe
      g.fillStyle(FARBEN[farbe], 0.25).fillRect(x - 12, y - 6, LAMPE + 24, LAMPE + 12).fillRect(x - 6, y - 12, LAMPE + 12, LAMPE + 24);
    }
    // Lampe mit abgeschrägten Ecken
    g.fillStyle(an ? FARBEN[farbe] : LAMPE_AUS[farbe]);
    g.fillRect(x + 4, y, LAMPE - 8, LAMPE).fillRect(x, y + 4, LAMPE, LAMPE - 8);
    // Glanzpunkt
    g.fillStyle(0xffffff, an ? 0.7 : 0.08).fillRect(x + 6, y + 6, 8, 4).fillRect(x + 6, y + 10, 4, 4);
  }
}
