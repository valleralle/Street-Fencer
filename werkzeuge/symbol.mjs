// Zeichnet das Programmsymbol von Street Fencer – überall dasselbe: der rote Fechter im Ausfall
// mit gestrecktem Degen auf dem dunklen Hintergrund des Spiels. Schreibt:
//   grafik/street-fencer.ico   – Symbol der .exe (16, 32, 48 und 256 Pixel)
//   public/favicon.ico, public/symbol-16.png, -32.png, -48.png – Symbol im Browser-Tab
//   public/apple-touch-icon.png, symbol-192.png, symbol-512.png, symbol-maskable-512.png
//                              – Symbol der Web-App auf dem Homescreen (iPhone, Android-Browser)
//   werkzeuge/android/res/     – Symbol der Android-App in allen Auflösungen (rund, eckig und
//                                als „adaptive icon“: Fechter vorn, Hallenwand als Hintergrund)
//   grafik/symbol-vorschau.png – Tab- und .exe-Größen vergrößert auf dunklem und hellem Grund
// Aufruf: npm run symbol
import { mkdirSync, writeFileSync } from 'node:fs';
import { FARBEN, POSEN } from '../src/pixelart/fechterPosen.js';
import { FECHTERFARBEN } from '../src/farben.js';
import { png, rgb } from './png.mjs';

const ziel = (pfad) => new URL(`../${pfad}`, import.meta.url);
const PALETTE = {
  ...FARBEN,
  S: FECHTERFARBEN.rot,
  T: FECHTERFARBEN.rot,
  R: FECHTERFARBEN.rot,
  B: '#e8ecf2', // Klinge, Licht
  P: '#d8dce4', // Glocke
  Q: '#8e95a3', // Glocke, Rand
};

// Leeres Raster und Zeichenhilfen
const raster = (groesse) => Array.from({ length: groesse }, () => Array(groesse).fill('.'));
const setze = (r, x, y, c) => {
  if (y >= 0 && y < r.length && x >= 0 && x < r.length) r[y][x] = c;
};
const umrande = (r) => {
  const n = r.length;
  const voll = (x, y) => x >= 0 && x < n && y >= 0 && y < n && r[y][x] !== '.' && r[y][x] !== 'K';
  const kopie = r.map((z) => [...z]);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (r[y][x] === '.' && (voll(x - 1, y) || voll(x + 1, y) || voll(x, y - 1) || voll(x, y + 1))) kopie[y][x] = 'K';
  return kopie;
};

// Fechter im Ausfall aus dem Spiel, mit gestrecktem Degen bis an den Rand (n × n)
function fechter(n = 48) {
  const r = raster(n);
  const pose = POSEN.ausfall;
  const zeilen = pose.pixel;
  const oben = zeilen.findIndex((z) => /[^.]/.test(z));
  const links = Math.min(...zeilen.map((z) => z.search(/[^.]/)).filter((i) => i >= 0));
  const dy = -oben + Math.floor((n - (zeilen.length - oben)) / 2);
  const dx = -links + 1;
  zeilen.forEach((z, y) => [...z].forEach((c, x) => c !== '.' && setze(r, x + dx, y + dy, c)));
  // Degen: Glocke an der Hand, Klinge waagerecht bis zum Rand
  const [hx, hy] = [pose.hand[0] + dx, pose.hand[1] + dy];
  for (let x = hx + 1; x < n - 1; x++) setze(r, x, hy, 'B');
  for (let y = hy - 2; y <= hy + 2; y++) setze(r, hx, y, Math.abs(y - hy) === 2 ? 'Q' : 'P');
  return umrande(r);
}

// Das Raster auf inhalt × inhalt Pixel skaliert, mittig in groesse × groesse. Beim Vergrößern
// nächstgelegen (pixelig), beim Verkleinern (Tab-Symbol) gemittelt, damit der Fechter erkennbar bleibt.
// form: 'kreis', 'eckig' (abgerundet) oder 'voll' (ganzes Quadrat) mit Hintergrund, sonst durchsichtig.
const HINTERGRUND = '#1d2330'; // Hintergrund des Spiels
function bild(r, groesse, inhalt, form) {
  const n = r.length;
  const versatz = Math.round((groesse - inhalt) / 2);
  const grund = rgb(HINTERGRUND);
  const halb = groesse / 2;
  const ecke = groesse * 0.18;
  const imGrund = (x, y) => {
    if (form === 'voll') return true;
    if (form === 'kreis') return Math.hypot(x + 0.5 - halb, y + 0.5 - halb) <= halb;
    if (form !== 'eckig') return false;
    // Abgerundetes Quadrat: Abstand zum inneren Rechteck höchstens ecke
    const dx = Math.max(ecke - x - 0.5, 0, x + 0.5 - (groesse - ecke));
    const dy = Math.max(ecke - y - 0.5, 0, y + 0.5 - (groesse - ecke));
    return Math.hypot(dx, dy) <= ecke;
  };
  // Farbe und Deckkraft (0 bis 1) des Inhalts an Bildpixel x, y
  const inhaltBei = (x, y) => {
    const [x0, x1] = [((x - versatz) * n) / inhalt, ((x + 1 - versatz) * n) / inhalt];
    const [y0, y1] = [((y - versatz) * n) / inhalt, ((y + 1 - versatz) * n) / inhalt];
    if (inhalt >= n) {
      const [qx, qy] = [Math.floor(x0), Math.floor(y0)];
      const c = qx >= 0 && qx < n && qy >= 0 && qy < n ? r[qy][qx] : '.';
      return c === '.' ? [[0, 0, 0], 0] : [rgb(PALETTE[c]), 1];
    }
    const summe = [0, 0, 0];
    let voll = 0;
    let felder = 0;
    for (let qy = Math.floor(y0); qy < Math.ceil(y1); qy++)
      for (let qx = Math.floor(x0); qx < Math.ceil(x1); qx++) {
        felder++;
        const c = qx >= 0 && qx < n && qy >= 0 && qy < n ? r[qy][qx] : '.';
        if (c === '.') continue;
        rgb(PALETTE[c]).forEach((v, i) => (summe[i] += v));
        voll++;
      }
    return voll ? [summe.map((v) => v / voll), voll / felder] : [[0, 0, 0], 0];
  };
  const out = [];
  for (let y = 0; y < groesse; y++)
    for (let x = 0; x < groesse; x++) {
      const [farbe, deckung] = inhaltBei(x, y);
      if (imGrund(x, y)) out.push([...farbe.map((v, i) => Math.round(v * deckung + grund[i] * (1 - deckung))), 255]);
      else if (!form && deckung) out.push([...farbe.map(Math.round), Math.round(deckung * 255)]);
      else out.push([0, 0, 0, 0]);
    }
  return { n: groesse, out };
}
const alsPng = (b) => png(b.n, b.n, b.out);

// Größen je Bildschirmdichte: Symbol 48 dp, Vordergrund des adaptive icon 108 dp (davon sind
// nur die mittleren 66 dp sicher sichtbar – der Fechter bleibt darin)
const DICHTEN = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
function androidSymbole() {
  const res = ziel('werkzeuge/android/res/');
  const r = fechter(64);
  for (const [dichte, faktor] of Object.entries(DICHTEN)) {
    const ordner = new URL(`mipmap-${dichte}/`, res);
    mkdirSync(ordner, { recursive: true });
    const symbol = 48 * faktor;
    const vorn = 108 * faktor;
    writeFileSync(new URL('ic_launcher.png', ordner), alsPng(bild(r, symbol, Math.round(symbol * 0.8), 'eckig')));
    writeFileSync(new URL('ic_launcher_round.png', ordner), alsPng(bild(r, symbol, Math.round(symbol * 0.74), 'kreis')));
    writeFileSync(new URL('ic_launcher_foreground.png', ordner), alsPng(bild(r, vorn, Math.round(vorn * 0.6))));
  }
  mkdirSync(new URL('values/', res), { recursive: true });
  writeFileSync(
    new URL('values/ic_launcher_background.xml', res),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${HINTERGRUND}</color>\n</resources>\n`,
  );
}

// Tab und .exe: abgerundetes Quadrat wie das Symbol der Android-App; der Fechter füllt es fast ganz,
// damit er auch mit 16 Pixeln noch zu erkennen ist
const r = fechter(64);
const bilder = Object.fromEntries([16, 32, 48, 256].map((g) => [g, bild(r, g, Math.round(g * (g < 48 ? 0.95 : 0.84)), 'eckig')]));
const pngs = Object.fromEntries(Object.entries(bilder).map(([g, b]) => [g, alsPng(b)]));

// ICO-Datei: Kopf, Verzeichnis, dann die PNG-Daten jeder Größe
function ico(groessen) {
  const kopf = Buffer.alloc(6);
  kopf.writeUInt16LE(0, 0);
  kopf.writeUInt16LE(1, 2); // Typ: Symbol
  kopf.writeUInt16LE(groessen.length, 4);
  let versatz = 6 + 16 * groessen.length;
  const eintraege = groessen.map((g) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(g === 256 ? 0 : g, 0);
    e.writeUInt8(g === 256 ? 0 : g, 1);
    e.writeUInt16LE(1, 4); // Farbebenen
    e.writeUInt16LE(32, 6); // Bit pro Pixel
    e.writeUInt32LE(pngs[g].length, 8);
    e.writeUInt32LE(versatz, 12);
    versatz += pngs[g].length;
    return e;
  });
  return Buffer.concat([kopf, ...eintraege, ...groessen.map((g) => pngs[g])]);
}
writeFileSync(ziel('grafik/street-fencer.ico'), ico([16, 32, 48, 256]));
writeFileSync(ziel('public/favicon.ico'), ico([16, 32, 48]));
for (const g of [16, 32, 48]) writeFileSync(ziel(`public/symbol-${g}.png`), pngs[g]);

// Vorschau: oben dunkler, unten heller Grund; 16 achtfach, 32 sechsfach, 48 vierfach, 256 einfach
const vergroessert = (b, m) => ({
  n: b.n * m,
  out: Array.from({ length: (b.n * m) ** 2 }, (_, i) => b.out[Math.floor(Math.floor(i / (b.n * m)) / m) * b.n + Math.floor((i % (b.n * m)) / m)]),
});
const vorschau = [vergroessert(bilder[16], 8), vergroessert(bilder[32], 6), vergroessert(bilder[48], 4), bilder[256]];
const breite = vorschau.reduce((s, b) => s + b.n + 16, 16);
const hoehe = 2 * (256 + 32);
const leinwand = Array.from({ length: breite * hoehe }, (_, i) => (Math.floor(i / breite) < hoehe / 2 ? [29, 35, 48, 255] : [236, 239, 244, 255]));
const male = (b, x0, y0) => {
  for (let y = 0; y < b.n; y++)
    for (let x = 0; x < b.n; x++) {
      const p = b.out[y * b.n + x];
      if (p[3]) leinwand[(y + y0) * breite + x + x0] = p;
    }
};
for (const reihe of [16, hoehe / 2 + 16]) {
  let x = 16;
  for (const b of vorschau) {
    male(b, x, reihe);
    x += b.n + 16;
  }
}
writeFileSync(ziel('grafik/symbol-vorschau.png'), png(breite, hoehe, leinwand));
androidSymbole();

// Web-App: das iPhone rundet die Ecken selbst ab, „maskable“ lässt Android Rand für seine Form
writeFileSync(ziel('public/apple-touch-icon.png'), alsPng(bild(r, 180, 144, 'voll')));
writeFileSync(ziel('public/symbol-192.png'), alsPng(bild(r, 192, 154, 'voll')));
writeFileSync(ziel('public/symbol-512.png'), alsPng(bild(r, 512, 410, 'voll')));
writeFileSync(ziel('public/symbol-maskable-512.png'), alsPng(bild(r, 512, 307, 'voll')));
console.log('Symbol gespeichert: grafik/street-fencer.ico, public/favicon.ico, public/symbol-*.png, public/apple-touch-icon.png, werkzeuge/android/res/, grafik/symbol-vorschau.png');
