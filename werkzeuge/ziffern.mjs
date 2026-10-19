// Baut aus den Pixel-Ziffern (src/pixelart/ziffern.js) eine kleine Schrift, die nur 0–9 und „:“ enthält:
//   public/schrift/street-fencer-ziffern.ttf – wird in index.html als Teil von „Pixelify Sans“ eingebunden
//   grafik/ziffern-vorschau.png              – alle Ziffern in den Größen und Farben des Spiels
// Maße wie Pixelify Sans, damit Zahlen gleich breit und hoch bleiben: ein Bildpunkt = 0,09 em,
// Ziffern 6,5 Bildpunkte breit (Doppelpunkt 2,5), Abstand links 0,67 Bildpunkte.
// Aufruf: npm run ziffern
import { writeFileSync } from 'node:fs';
import opentype from 'opentype.js';
import { ZIFFERN } from '../src/pixelart/ziffern.js';
import { FECHTERFARBEN } from '../src/farben.js';
import { png, rgb } from './png.mjs';

const ziel = (pfad) => new URL(`../${pfad}`, import.meta.url);
const EM = 1000;
const PUNKT = 90;
const LINKS = 60;
const VORSCHUB = { ziffer: 586, ':': 222 };

function glyphe(zeichen, raster) {
  const pfad = new opentype.Path();
  const hoehe = raster.length;
  raster.forEach((zeile, y) =>
    [...zeile].forEach((c, x) => {
      if (c !== '#') return;
      // Quadrat im Uhrzeigersinn (TrueType), y zählt von der Grundlinie nach oben
      const [x0, y0] = [LINKS + x * PUNKT, (hoehe - 1 - y) * PUNKT];
      pfad.moveTo(x0, y0);
      pfad.lineTo(x0, y0 + PUNKT);
      pfad.lineTo(x0 + PUNKT, y0 + PUNKT);
      pfad.lineTo(x0 + PUNKT, y0);
      pfad.close();
    }),
  );
  return new opentype.Glyph({
    name: zeichen === ':' ? 'colon' : `ziffer${zeichen}`,
    unicode: zeichen.codePointAt(0),
    advanceWidth: zeichen === ':' ? VORSCHUB[':'] : VORSCHUB.ziffer,
    path: pfad,
  });
}

const leer = new opentype.Glyph({ name: '.notdef', unicode: 0, advanceWidth: VORSCHUB.ziffer, path: new opentype.Path() });
const schrift = new opentype.Font({
  familyName: 'Street Fencer Ziffern',
  styleName: 'Regular',
  unitsPerEm: EM,
  ascender: 920,
  descender: -280,
  glyphs: [leer, ...Object.entries(ZIFFERN).map(([z, r]) => glyphe(z, r))],
});
writeFileSync(ziel('public/schrift/street-fencer-ziffern.ttf'), Buffer.from(schrift.toArrayBuffer()));

// Vorschau: die Farben des Spiels, je Zeile eine Größe (Punktestand 48 px ≈ 4 Pixel je Bildpunkt,
// Uhr 20 px ≈ 2, kleinster Text ≈ 1), auf dem dunklen Grund des Meldegeräts
const FARBEN = [FECHTERFARBEN.rot, FECHTERFARBEN.gruen, '#ffd166', '#ffffff'];
const zeichen = Object.keys(ZIFFERN);
const MASSSTAEBE = [4, 2, 1];
const breiteZeile = (m) => zeichen.reduce((s, z) => s + (ZIFFERN[z][0].length + 1) * m, 0);
const breite = 16 + FARBEN.length * (breiteZeile(4) + 16);
const hoehe = 16 + MASSSTAEBE.reduce((s, m) => s + 7 * m + 16, 0);
const bild = Array.from({ length: breite * hoehe }, () => [...rgb('#0f1218'), 255]);
let y0 = 16;
for (const m of MASSSTAEBE) {
  let x0 = 16;
  for (const farbe of FARBEN) {
    let x = x0;
    for (const z of zeichen) {
      ZIFFERN[z].forEach((zeile, y) =>
        [...zeile].forEach((c, x1) => {
          if (c !== '#') return;
          for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) bild[(y0 + y * m + a) * breite + x + x1 * m + b] = [...rgb(farbe), 255];
        }),
      );
      x += (ZIFFERN[z][0].length + 1) * m;
    }
    x0 += breiteZeile(4) + 16;
  }
  y0 += 7 * m + 16;
}
writeFileSync(ziel('grafik/ziffern-vorschau.png'), png(breite, hoehe, bild));
console.log('Ziffern gespeichert: public/schrift/street-fencer-ziffern.ttf, grafik/ziffern-vorschau.png');
