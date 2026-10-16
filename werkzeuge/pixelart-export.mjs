// Macht aus den Textrastern in src/pixelart/fechterPosen.js PNG-Dateien in grafik/:
//   fechter-rot.png, fechter-gruen.png – alle Posen nebeneinander in Originalgröße (z. B. für Piskel)
//   vorschau.png                      – beide Fechter stark vergrößert auf dunklem Grund
// Aufruf: npm run pixelart
import { mkdirSync, writeFileSync } from 'node:fs';
import { BREITE, HOEHE, FARBEN, POSEN } from '../src/pixelart/fechterPosen.js';
import { FECHTERFARBEN } from '../src/farben.js';
import { png, rgb } from './png.mjs';

const SCHUHE = FECHTERFARBEN;
const HINTERGRUND = '#1d2330';
const ZIEL = new URL('../grafik/', import.meta.url);

// Zeichnet alle Posen nebeneinander; spiegeln = Grün schaut nach links
function bogen(schuhfarbe, { massstab = 1, rand = 0, hintergrund = null, spiegeln = false } = {}) {
  const namen = Object.keys(POSEN);
  const zelleB = BREITE * massstab + rand * 2;
  const zelleH = HOEHE * massstab + rand * 2;
  const breite = zelleB * namen.length;
  const leer = hintergrund ? [...rgb(hintergrund), 255] : [0, 0, 0, 0];
  const pixel = Array.from({ length: breite * zelleH }, () => leer);
  const farben = { ...FARBEN, S: schuhfarbe, T: schuhfarbe };

  namen.forEach((name, i) => {
    POSEN[name].pixel.forEach((zeile, y) => {
      [...zeile].forEach((zeichen, x) => {
        if (zeichen === '.') return;
        const sx = spiegeln ? BREITE - 1 - x : x;
        for (let dy = 0; dy < massstab; dy++) {
          for (let dx = 0; dx < massstab; dx++) {
            const px = i * zelleB + rand + sx * massstab + dx;
            const py = rand + y * massstab + dy;
            pixel[py * breite + px] = [...rgb(farben[zeichen]), 255];
          }
        }
      });
    });
  });
  return { breite, hoehe: zelleH, pixel };
}

mkdirSync(ZIEL, { recursive: true });
for (const [farbe, hex] of Object.entries(SCHUHE)) {
  const b = bogen(hex, { spiegeln: farbe === 'gruen' });
  writeFileSync(new URL(`fechter-${farbe}.png`, ZIEL), png(b.breite, b.hoehe, b.pixel));
}

// Vorschau: oben Rot, darunter Grün, jeweils 6-fach vergrößert
const rot = bogen(SCHUHE.rot, { massstab: 6, rand: 12, hintergrund: HINTERGRUND });
const gruen = bogen(SCHUHE.gruen, { massstab: 6, rand: 12, hintergrund: HINTERGRUND, spiegeln: true });
writeFileSync(new URL('vorschau.png', ZIEL), png(rot.breite, rot.hoehe * 2, [...rot.pixel, ...gruen.pixel]));

console.log(`Posen: ${Object.keys(POSEN).join(', ')}`);
console.log('Gespeichert in grafik/: fechter-rot.png, fechter-gruen.png, vorschau.png');
