// Macht aus den Textrastern in src/pixelart/fechterPosen.js PNG-Dateien in grafik/:
//   fechter-rot.png, fechter-gruen.png – alle Posen nebeneinander in Originalgröße (z. B. für Piskel)
//   vorschau.png                      – beide Fechter stark vergrößert auf dunklem Grund
// Aufruf: npm run pixelart
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { BREITE, HOEHE, FARBEN, POSEN } from '../src/pixelart/fechterPosen.js';
import { FECHTERFARBEN } from '../src/farben.js';

const SCHUHE = FECHTERFARBEN;
const HINTERGRUND = '#1d2330';
const ZIEL = new URL('../grafik/', import.meta.url);

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function png(breite, hoehe, pixel) {
  const crcTabelle = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTabelle[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const block = (typ, daten) => {
    const laenge = Buffer.alloc(4);
    laenge.writeUInt32BE(daten.length);
    const inhalt = Buffer.concat([Buffer.from(typ), daten]);
    const pruef = Buffer.alloc(4);
    pruef.writeUInt32BE(crc(inhalt));
    return Buffer.concat([laenge, inhalt, pruef]);
  };
  const kopf = Buffer.alloc(13);
  kopf.writeUInt32BE(breite, 0);
  kopf.writeUInt32BE(hoehe, 4);
  kopf.set([8, 6, 0, 0, 0], 8); // 8 Bit, RGBA
  const roh = Buffer.alloc((breite * 4 + 1) * hoehe);
  for (let y = 0; y < hoehe; y++) {
    roh[y * (breite * 4 + 1)] = 0;
    for (let x = 0; x < breite; x++) roh.set(pixel[y * breite + x], y * (breite * 4 + 1) + 1 + x * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    block('IHDR', kopf),
    block('IDAT', deflateSync(roh)),
    block('IEND', Buffer.alloc(0)),
  ]);
}

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
