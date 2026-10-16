// Baut „release/Street Fencer.exe“: das gebaute Spiel (dist/) plus eine Node-Laufzeit in einer Datei.
// Aufruf: npm run exe  (optional mit anderem Ziel: npm run exe -- pfad\zur.exe)
// Ablauf: Spiel bauen → alle Dateien aus dist/ als Assets in einen Node-SEA-Blob packen →
// node.exe kopieren und den Blob mit postject hineinschreiben.
import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { rcedit } from 'rcedit';

const PROJEKT = resolve(import.meta.dirname, '../..');
const DIST = join(PROJEKT, 'dist');
const ARBEIT = join(PROJEKT, '.exe-bau');
const ZIEL = process.argv[2] ? resolve(process.argv[2]) : join(PROJEKT, 'release', 'Street Fencer.exe');

const fuehreAus = (befehl) => execSync(befehl, { cwd: PROJEKT, stdio: 'inherit' });

console.log('1/4 Symbol zeichnen und Spiel bauen …');
fuehreAus('node werkzeuge/symbol.mjs');
fuehreAus('npm run build');

console.log('2/4 Spieldateien einsammeln …');
const dateien = [];
const sammle = (ordner) => {
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) sammle(pfad);
    else dateien.push(relative(DIST, pfad).split('\\').join('/'));
  }
};
sammle(DIST);

rmSync(ARBEIT, { recursive: true, force: true });
mkdirSync(ARBEIT, { recursive: true });
writeFileSync(join(ARBEIT, 'dateien.json'), JSON.stringify(dateien));
const assets = { 'dateien.json': join(ARBEIT, 'dateien.json') };
for (const d of dateien) assets[d] = join(DIST, d);

console.log(`3/4 ${dateien.length} Dateien in die Node-Laufzeit packen …`);
const blob = join(ARBEIT, 'spiel.blob');
writeFileSync(
  join(ARBEIT, 'sea-config.json'),
  JSON.stringify({
    main: join(PROJEKT, 'werkzeuge', 'exe', 'starter.cjs'),
    output: blob,
    disableExperimentalSEAWarning: true,
    useCodeCache: false,
    assets,
  }),
);
fuehreAus(`node --experimental-sea-config "${join(ARBEIT, 'sea-config.json')}"`);

console.log('4/4 .exe erzeugen …');
mkdirSync(join(ZIEL, '..'), { recursive: true });
rmSync(ZIEL, { force: true });
copyFileSync(process.execPath, ZIEL);
// Programmsymbol und Angaben in den Dateieigenschaften – vor dem Einbetten des Spiels
await rcedit(ZIEL, {
  icon: join(PROJEKT, 'grafik', 'street-fencer.ico'),
  'version-string': {
    ProductName: 'Street Fencer',
    FileDescription: 'Street Fencer – Degenfechten im Browser',
    InternalName: 'Street Fencer',
    OriginalFilename: 'Street Fencer.exe',
    CompanyName: '',
    LegalCopyright: '',
  },
});
fuehreAus(
  `npx postject "${ZIEL}" NODE_SEA_BLOB "${blob}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
);
rmSync(ARBEIT, { recursive: true, force: true });

const mb = (statSync(ZIEL).size / 1024 / 1024).toFixed(0);
console.log(`Fertig: ${relative(PROJEKT, ZIEL)} (${mb} MB)`);
