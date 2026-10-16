// Startprogramm von „Street Fencer.exe“: liefert das eingebaute Spiel über einen kleinen Webserver
// auf diesem Rechner aus und öffnet es im Standardbrowser. Die Spieldateien stecken in der .exe
// (als „Assets“ einer Node Single Executable Application), siehe baue-exe.mjs.
const http = require('node:http');
const { exec } = require('node:child_process');
const sea = require('node:sea');

// Feste Adresse: Der Browser speichert Einstellungen pro Adresse – mit wechselndem Port wären sie bei jedem Start weg
const PORT = 41730;
const ADRESSE = `http://127.0.0.1:${PORT}/`;

const ARTEN = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json',
  png: 'image/png',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  woff2: 'font/woff2',
  txt: 'text/plain; charset=utf-8',
};

const dateien = new Set(JSON.parse(sea.getAsset('dateien.json', 'utf8')));

const server = http.createServer((anfrage, antwort) => {
  let pfad = decodeURIComponent(new URL(anfrage.url, ADRESSE).pathname).replace(/^\/+/, '');
  if (pfad === '') pfad = 'index.html';
  if (!dateien.has(pfad)) {
    antwort.writeHead(404, { 'Content-Type': ARTEN.txt });
    antwort.end('Nicht gefunden');
    return;
  }
  const endung = pfad.split('.').pop().toLowerCase();
  antwort.writeHead(200, { 'Content-Type': ARTEN[endung] ?? 'application/octet-stream' });
  antwort.end(Buffer.from(sea.getAsset(pfad)));
});

// Mit STREET_FENCER_OHNE_BROWSER=1 (zum Testen) wird kein Browserfenster geöffnet
function oeffneBrowser() {
  if (process.env.STREET_FENCER_OHNE_BROWSER) return;
  exec(`start "" "${ADRESSE}"`);
}

server.on('error', (fehler) => {
  if (fehler.code === 'EADDRINUSE') {
    // Läuft schon (z. B. doppelt gestartet): einfach das laufende Spiel öffnen
    console.log('Street Fencer läuft bereits – öffne es im Browser.');
    oeffneBrowser();
    setTimeout(() => process.exit(0), 1500);
  } else {
    console.error('Street Fencer konnte nicht starten:', fehler.message);
    setTimeout(() => process.exit(1), 10000);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Street Fencer läuft unter ' + ADRESSE);
  console.log('Das Spiel öffnet sich im Browser. Zum Beenden dieses Fenster schließen.');
  oeffneBrowser();
});
