// Zeichnet die Pixelbilder der Fechter aus Formen (Glieder, Maske, Rumpf) und schreibt sie als
// Textraster nach src/pixelart/fechterPosen.js. Aufruf: npm run pixelart:zeichnen
// Achtung: Das überschreibt Pixel, die von Hand in fechterPosen.js geändert wurden.
// Stil nach Vorlage: dunkle Umrandung, schwarze Maske mit weißem Latz, Handschuh in Fechterfarbe (T),
// hautfarbene hintere Hand (F).
import { writeFileSync } from 'node:fs';
const B = 40, H = 50;
const neu = () => Array.from({ length: H }, () => Array(B).fill('.'));
const px = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < B && y >= 0 && y < H) g[y][x] = c; };
const rect = (g, x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px(g, x, y, c); };
const pinsel = (g, x, y, d, c) => rect(g, x - Math.floor((d - 1) / 2), y - Math.floor((d - 1) / 2), x + Math.ceil((d - 1) / 2), y + Math.ceil((d - 1) / 2), c);
const linie = (g, [x0, y0], [x1, y1], c, d0 = 1, d1 = d0) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) pinsel(g, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), Math.round(d0 + ((d1 - d0) * i) / n), c);
};
// Glied mit Schattenseite: erst Schatten (versetzt), dann Grundfarbe
const glied = (g, p, farbe, schatten, d0, d1) => {
  for (let i = 0; i < p.length - 1; i++) linie(g, [p[i][0] - 1, p[i][1] + 1], [p[i + 1][0] - 1, p[i + 1][1] + 1], schatten, d0, d1);
  for (let i = 0; i < p.length - 1; i++) linie(g, p[i], p[i + 1], farbe, i === 0 ? d0 : d1, d1);
};
// Maske: schwarze Kuppel, vorn unten der weiße Latz, hinten ein Haarbüschel
const maske = (g, cx, oy) => {
  const zeilen = [[2, 6], [1, 7], [0, 8], [0, 8], [0, 8], [0, 8], [0, 8], [0, 8], [1, 8], [2, 7]];
  zeilen.forEach(([a, b], dy) => { for (let x = a; x <= b; x++) px(g, cx - 4 + x, oy + dy, 'M'); });
  rect(g, cx - 2, oy + 1, cx + 1, oy + 1, 'N'); px(g, cx - 3, oy + 2, 'N');
  rect(g, cx + 1, oy + 5, cx + 4, oy + 9, 'W'); rect(g, cx + 2, oy + 4, cx + 4, oy + 4, 'W');
  rect(g, cx, oy + 10, cx + 3, oy + 11, 'W'); px(g, cx + 1, oy + 9, 'L');
  rect(g, cx - 5, oy + 2, cx - 5, oy + 5, 'H'); px(g, cx - 6, oy + 4, 'H');
};
const rumpf = (g, cx, y0, y1, neig = 0) => {
  for (let y = y0; y <= y1; y++) {
    const f = (y - y0) / (y1 - y0);
    const halb = Math.round(5 - f * 1.2), v = Math.round(neig * (1 - f));
    rect(g, cx - halb + v, y, cx + halb + v, y, 'W');
    rect(g, cx - halb + v, y, cx - halb + 1 + v, y, 'L'); px(g, cx - halb + v, y, 'G');
    if (y > y0 + 2) px(g, cx + v + 1, y, 'L');
  }
};
const schuh = (g, x, y, vorn) => { rect(g, x, y, x + 5, y + 2, 'S'); if (vorn) rect(g, x + 6, y + 1, x + 6, y + 2, 'S'); };
const handschuh = (g, [x, y]) => { rect(g, x - 2, y - 1, x + 1, y + 1, 'T'); rect(g, x - 3, y - 2, x - 2, y + 2, 'T'); };
// Nackte hintere Hand: deckt das Ende des Ärmels ganz ab, damit dort kein Weiß hervorschaut
const hand = (g, [x, y]) => { rect(g, x - 1, y - 1, x + 1, y + 1, 'F'); px(g, x - 2, y, 'F'); };
const knie = (g, [x, y]) => { px(g, x, y, 'Y'); px(g, x + 1, y, 'Y'); };
// Umrandung: jedes leere Feld direkt neben der Figur wird dunkel
const umrande = (g) => {
  const voll = (x, y) => x >= 0 && x < B && y >= 0 && y < H && g[y][x] !== '.' && g[y][x] !== 'K';
  const kopie = g.map((z) => [...z]);
  for (let y = 0; y < H; y++) for (let x = 0; x < B; x++)
    if (g[y][x] === '.' && (voll(x - 1, y) || voll(x + 1, y) || voll(x, y - 1) || voll(x, y + 1))) kopie[y][x] = 'K';
  return kopie;
};

const posen = {}, haende = {}, fuesse = {};
const figur = (name, { oy = 0, neig = 0, vorn, hinten, arm, rueckArm, kopfX = 17 }) => {
  const g = neu();
  glied(g, rueckArm.map(([x, y]) => [x, y + oy]), 'L', 'G', 3, 3);
  hand(g, [rueckArm[2][0], rueckArm[2][1] + oy]);
  glied(g, hinten, 'L', 'D', 5, 3);
  rumpf(g, 16, 12 + oy, 28 + oy, neig);
  glied(g, vorn, 'W', 'L', 5, 4);
  knie(g, vorn[1]); knie(g, [hinten[1][0] - 1, hinten[1][1]]);
  schuh(g, hinten[2][0] - 3, 47, false);
  schuh(g, vorn[2][0] - 2, 47, true);
  maske(g, kopfX + neig, oy);
  const a = arm.map(([x, y]) => [x + neig, y + oy]);
  // dunkle Kante unter dem Arm, damit er sich vom weißen Rumpf abhebt
  for (let i = 0; i < a.length - 1; i++) linie(g, [a[i][0], a[i][1] + 2], [a[i + 1][0], a[i + 1][1] + 2], 'G', 2, 2);
  glied(g, a, 'W', 'L', 3, 3);
  const h = [arm[2][0] + neig, arm[2][1] + oy];
  handschuh(g, h);
  posen[name] = umrande(g); haende[name] = [h[0] + 2, h[1]]; fuesse[name] = vorn[2][0] + 5;
};
const egVorn = [[19, 29], [24, 37], [24, 45]], egHinten = [[13, 29], [9, 37], [6, 45]];
const egArm = [[21, 14], [25, 20], [29, 18]], egRueck = [[11, 14], [7, 16], [8, 11]];

figur('grundstellung', { vorn: egVorn, hinten: egHinten, arm: egArm, rueckArm: egRueck });
figur('gehen1', { vorn: [[19, 29], [23, 37], [22, 45]], hinten: [[13, 29], [11, 37], [9, 45]], arm: egArm, rueckArm: egRueck });
figur('gehen2', { vorn: [[19, 29], [25, 37], [26, 45]], hinten: [[13, 29], [8, 37], [4, 45]], arm: egArm, rueckArm: egRueck });
figur('stoss', { vorn: egVorn, hinten: egHinten, arm: [[21, 14], [27, 15], [33, 15]], rueckArm: egRueck });
figur('parade', { vorn: egVorn, hinten: egHinten, arm: [[21, 14], [25, 12], [26, 6]], rueckArm: egRueck });
figur('offen', { neig: -2, vorn: [[19, 29], [23, 37], [25, 45]], hinten: [[13, 29], [7, 36], [4, 45]], arm: [[20, 14], [23, 21], [25, 26]], rueckArm: [[11, 14], [6, 10], [4, 5]] });
figur('ausfall', { oy: 4, neig: 2, vorn: [[20, 33], [30, 38], [31, 45]], hinten: [[13, 33], [8, 39], [4, 45]], arm: [[21, 14], [28, 15], [35, 15]], rueckArm: [[12, 14], [8, 18], [5, 21]] });
// Getroffen: zuckt nach hinten, der Waffenarm sackt herab, der hintere Arm fliegt hoch
figur('getroffen', { oy: 1, neig: -3, vorn: [[19, 30], [22, 38], [23, 45]], hinten: [[13, 30], [8, 37], [5, 45]], arm: [[20, 15], [22, 22], [23, 28]], rueckArm: [[11, 15], [6, 9], [3, 4]] });
// Jubel: beide Arme hoch, aufrecht
figur('jubel', { vorn: [[19, 29], [21, 37], [21, 45]], hinten: [[13, 29], [11, 37], [10, 45]], arm: [[21, 14], [24, 8], [25, 2]], rueckArm: [[11, 14], [8, 8], [8, 3]] });

// Flèche: Sturmangriff im Laufen – weit nach vorn gelehnt, hinteres Bein abgestoßen und in der Luft
{
  const g = neu();
  const oy = 3, neig = 4;
  glied(g, [[12, 14 + oy], [8, 18 + oy], [4, 21 + oy]], 'L', 'G', 3, 3); hand(g, [4, 21 + oy]);
  glied(g, [[13, 32], [8, 37], [3, 40]], 'L', 'D', 5, 3); knie(g, [7, 37]);
  rect(g, 0, 40, 4, 42, 'S'); // hinterer Schuh, vom Boden abgehoben
  rumpf(g, 16, 12 + oy, 28 + oy, neig);
  glied(g, [[19, 32], [27, 38], [28, 45]], 'W', 'L', 5, 4); knie(g, [27, 38]);
  schuh(g, 26, 47, true);
  maske(g, 17 + neig, oy);
  linie(g, [21 + neig, 16 + oy], [36, 17 + oy], 'G', 2, 2);
  glied(g, [[21 + neig, 14 + oy], [29, 15 + oy], [36, 15 + oy]], 'W', 'L', 3, 3); handschuh(g, [36, 15 + oy]);
  posen.fleche = umrande(g); haende.fleche = [38, 15 + oy]; fuesse.fleche = 33;
}

// Tiefstoß: tief geduckt, Oberkörper nach vorn, Stoß zum Fuß
{
  const g = neu();
  // hinterer Arm zum Ausbalancieren nach hinten oben
  glied(g, [[17, 33], [12, 31], [10, 27]], 'L', 'G', 3, 3); hand(g, [10, 27]);
  // hinteres Bein: Knie fast am Boden, Unterschenkel liegt flach
  glied(g, [[14, 41], [9, 45], [4, 46]], 'L', 'D', 5, 3); knie(g, [8, 45]);
  // Oberkörper schräg nach vorn gebeugt
  glied(g, [[21, 33], [16, 40]], 'W', 'L', 8, 7);
  linie(g, [17, 33], [12, 40], 'L', 2, 2);
  // vorderes Bein tief gebeugt, Oberschenkel fast waagerecht
  glied(g, [[18, 41], [25, 40], [25, 45]], 'W', 'L', 5, 4); knie(g, [25, 40]);
  schuh(g, 1, 47, false); schuh(g, 23, 47, true);
  maske(g, 23, 20);
  // Waffenarm stößt nach unten vorn zum Fuß des Gegners
  linie(g, [23, 35], [28, 40], 'G', 2, 2); linie(g, [28, 40], [32, 45], 'G', 2, 2);
  glied(g, [[23, 33], [28, 38], [32, 43]], 'W', 'L', 3, 3); handschuh(g, [32, 43]);
  posen.tiefstoss = umrande(g); haende.tiefstoss = [34, 43]; fuesse.tiefstoss = 30;
}

const reihenfolge = ['grundstellung', 'gehen1', 'gehen2', 'stoss', 'ausfall', 'parade', 'tiefstoss', 'offen', 'fleche', 'getroffen', 'jubel'];
const zeilen = [
  `// Pixelbilder der Fechter – jede Pose ist ${B} × ${H} Pixel und schaut nach rechts.`,
  '// Jedes Zeichen ist ein Pixel; die Farben stehen in FARBEN.',
  '// S = Schuh und T = Handschuh, beide in der Farbe des Fechters (Rot oder Grün).',
  '// hand = Pixel, an dem der Degen ansetzt; vordererFuss = vorderste Spalte des vorderen Schuhs.',
  '// Erzeugt von werkzeuge/pixelart-zeichnen.mjs (npm run pixelart:zeichnen).',
  '',
  `export const BREITE = ${B};`,
  `export const HOEHE = ${H};`,
  '// Spalte, die bei allen Posen über dem Fechter-x liegt (Mitte des Rumpfs)',
  'export const MITTE_X = 16;',
  '',
  'export const FARBEN = {',
  "  K: '#0b0d12', // Umrandung",
  "  W: '#f4f6fa', // Anzug",
  "  L: '#cfd4de', // Anzug, Schatten",
  "  G: '#9aa1b0', // Anzug, tiefer Schatten",
  "  D: '#7a8191', // hinteres Bein, Schatten",
  "  M: '#1b1d22', // Maske",
  "  N: '#3a3e47', // Glanz auf der Maske",
  "  H: '#7a4a22', // Haare",
  "  F: '#e8b98a', // Haut (hintere Hand)",
  "  Y: '#d9c98a', // Kniedetail",
  '};',
  '',
  'export const POSEN = {',
];
for (const n of reihenfolge) {
  zeilen.push(`  ${n}: {`, `    hand: [${haende[n]}],`, `    vordererFuss: ${fuesse[n]},`, '    pixel: [');
  for (const z of posen[n]) zeilen.push(`      '${z.join('')}',`);
  zeilen.push('    ],', '  },');
}
zeilen.push('};', '');
writeFileSync(new URL('../src/pixelart/fechterPosen.js', import.meta.url), zeilen.join('\n'));
console.log(`Posen gezeichnet: ${reihenfolge.join(', ')}`);
