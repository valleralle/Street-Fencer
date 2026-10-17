// Zeichnet das Programmsymbol von Street Fencer und schreibt:
//   grafik/street-fencer.ico   – Symbol der .exe (16, 32, 48 und 256 Pixel)
//   public/symbol-16.png, -32.png – Symbol im Browser-Tab
//   grafik/symbol-vorschau.png – alle Größen vergrößert auf dunklem und hellem Grund
//   public/apple-touch-icon.png, symbol-192.png, symbol-512.png, symbol-maskable-512.png
//                              – Symbol der Web-App auf dem Homescreen (iPhone, Android-Browser)
//   werkzeuge/android/res/     – Symbol der Android-App in allen Auflösungen (rund, eckig und
//                                als „adaptive icon“: Fechter vorn, Hallenwand als Hintergrund)
// Groß (48, 256): ein Fechter im Ausfall mit gestrecktem Degen. Klein (16, 32): ein Degen –
// dafür ist der Fechter (46 Pixel hoch) zu groß.
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
  C: '#a4abb8', // Klinge, Schatten
  P: '#d8dce4', // Glocke
  Q: '#8e95a3', // Glocke, Rand
  O: '#5a4030', // Griff
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

// Degen schräg von links unten nach rechts oben, Pixel für Pixel gesetzt: Klinge (B, Schatten C),
// Glocke quer zur Klinge und zur Spitze hin gewölbt (P, Rand Q), roter Ring (R), Griff (O), Knauf (Q)
function degen(n) {
  const r = raster(n);
  const p = (x, y, c) => setze(r, x, y, c);
  if (n === 16) {
    for (let i = 0; i <= 8; i++) p(6 + i, 9 - i, 'B');
    [[3, 8], [7, 12]].forEach(([x, y]) => p(x, y, 'Q'));
    [[4, 9], [5, 10], [6, 11], [5, 9]].forEach(([x, y]) => p(x, y, 'P'));
    p(4, 11, 'R');
    p(3, 12, 'O');
    p(2, 13, 'O');
    p(1, 14, 'Q');
  } else {
    for (let i = 0; i <= 17; i++) {
      p(12 + i, 19 - i, 'B');
      p(13 + i, 19 - i, 'C');
    }
    for (let k = 0; k <= 8; k++) {
      const rand = k === 0 || k === 8;
      p(7 + k, 16 + k, rand ? 'Q' : 'P');
      p(8 + k, 16 + k, rand ? 'Q' : 'P');
      if (k >= 2 && k <= 6) p(9 + k, 16 + k - 1, k === 2 || k === 6 ? 'Q' : 'P'); // Wölbung zur Spitze
    }
    for (let j = 0; j <= 5; j++) {
      const farbe = j <= 1 ? 'R' : 'O';
      p(10 - j, 22 + j, farbe);
      p(11 - j, 22 + j, farbe);
    }
    [[3, 28], [4, 28], [3, 29], [4, 29]].forEach(([x, y]) => p(x, y, 'Q'));
  }
  return umrande(r);
}
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

// Raster → Pixel; massstab vergrößert, hintergrund füllt leere Felder
function pixel(r, { massstab = 1, hintergrund = null } = {}) {
  const n = r.length * massstab;
  const leer = hintergrund ? [...rgb(hintergrund), 255] : [0, 0, 0, 0];
  const out = Array.from({ length: n * n }, () => leer);
  r.forEach((zeile, y) =>
    zeile.forEach((c, x) => {
      if (c === '.') return;
      for (let a = 0; a < massstab; a++)
        for (let b = 0; b < massstab; b++) out[(y * massstab + a) * n + x * massstab + b] = [...rgb(PALETTE[c]), 255];
    }),
  );
  return { n, out };
}

// 256 Pixel: ein breiteres Raster (64), damit der Degen lang wird, vierfach vergrößert
function gross() {
  const { n, out } = pixel(fechter(64), { massstab: 4 });
  const voll = Array.from({ length: 256 * 256 }, () => [0, 0, 0, 0]);
  const rand = (256 - n) / 2;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) voll[(y + rand) * 256 + x + rand] = out[y * n + x];
  return { n: 256, out: voll };
}

// Android: das Raster nächstgelegen (pixelig) auf inhalt × inhalt Pixel skaliert, mittig in
// groesse × groesse. form: 'kreis', 'eckig' oder 'voll' (ganzes Quadrat) mit Hintergrund, sonst durchsichtig.
const HINTERGRUND = '#1d2330'; // Hintergrund des Spiels
function androidBild(r, groesse, inhalt, form) {
  const n = r.length;
  const versatz = Math.round((groesse - inhalt) / 2);
  const grund = [...rgb(HINTERGRUND), 255];
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
  const out = [];
  for (let y = 0; y < groesse; y++)
    for (let x = 0; x < groesse; x++) {
      const [qx, qy] = [Math.floor(((x - versatz) * n) / inhalt), Math.floor(((y - versatz) * n) / inhalt)];
      const c = qx >= 0 && qx < n && qy >= 0 && qy < n ? r[qy][qx] : '.';
      if (imGrund(x, y) && c !== '.') out.push([...rgb(PALETTE[c]), 255]);
      else if (imGrund(x, y)) out.push(grund);
      else if (!form && c !== '.') out.push([...rgb(PALETTE[c]), 255]);
      else out.push([0, 0, 0, 0]);
    }
  return png(groesse, groesse, out);
}

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
    writeFileSync(new URL('ic_launcher.png', ordner), androidBild(r, symbol, Math.round(symbol * 0.8), 'eckig'));
    writeFileSync(new URL('ic_launcher_round.png', ordner), androidBild(r, symbol, Math.round(symbol * 0.74), 'kreis'));
    writeFileSync(new URL('ic_launcher_foreground.png', ordner), androidBild(r, vorn, Math.round(vorn * 0.6)));
  }
  mkdirSync(new URL('values/', res), { recursive: true });
  writeFileSync(
    new URL('values/ic_launcher_background.xml', res),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${HINTERGRUND}</color>\n</resources>\n`,
  );
}

const bilder = {
  16: pixel(degen(16)),
  32: pixel(degen(32)),
  48: pixel(fechter()),
  256: gross(),
};
const pngs = Object.fromEntries(Object.entries(bilder).map(([g, b]) => [g, png(b.n, b.n, b.out)]));

// ICO-Datei: Kopf, Verzeichnis, dann die PNG-Daten jeder Größe
const groessen = Object.keys(pngs).map(Number);
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
writeFileSync(ziel('grafik/street-fencer.ico'), Buffer.concat([kopf, ...eintraege, ...groessen.map((g) => pngs[g])]));
writeFileSync(ziel('public/symbol-16.png'), pngs[16]);
writeFileSync(ziel('public/symbol-32.png'), pngs[32]);

// Vorschau: oben dunkler, unten heller Grund; 16 und 32 achtfach, 48 vierfach, 256 einfach
const vorschau = [
  [degen(16), 8],
  [degen(32), 6],
  [fechter(), 4],
];
const breite = vorschau.reduce((s, [r, m]) => s + r.length * m + 16, 16) + 256 + 16;
const hoehe = 2 * (256 + 32);
const bild = Array.from({ length: breite * hoehe }, (_, i) => (Math.floor(i / breite) < hoehe / 2 ? [29, 35, 48, 255] : [236, 239, 244, 255]));
const male = (b, x0, y0) => {
  for (let y = 0; y < b.n; y++)
    for (let x = 0; x < b.n; x++) {
      const p = b.out[y * b.n + x];
      if (p[3]) bild[(y + y0) * breite + x + x0] = p;
    }
};
for (const reihe of [16, hoehe / 2 + 16]) {
  let x = 16;
  for (const [r, m] of vorschau) {
    male(pixel(r, { massstab: m }), x, reihe);
    x += r.length * m + 16;
  }
  male(bilder[256], x, reihe);
}
writeFileSync(ziel('grafik/symbol-vorschau.png'), png(breite, hoehe, bild));
androidSymbole();

// Web-App: das iPhone rundet die Ecken selbst ab, „maskable“ lässt Android Rand für seine Form
const webR = fechter(64);
writeFileSync(ziel('public/apple-touch-icon.png'), androidBild(webR, 180, 144, 'voll'));
writeFileSync(ziel('public/symbol-192.png'), androidBild(webR, 192, 154, 'voll'));
writeFileSync(ziel('public/symbol-512.png'), androidBild(webR, 512, 410, 'voll'));
writeFileSync(ziel('public/symbol-maskable-512.png'), androidBild(webR, 512, 307, 'voll'));
console.log(
  'Symbol gespeichert: grafik/street-fencer.ico, public/symbol-16.png, public/symbol-32.png, grafik/symbol-vorschau.png, public/apple-touch-icon.png, public/symbol-*.png, werkzeuge/android/res/',
);
