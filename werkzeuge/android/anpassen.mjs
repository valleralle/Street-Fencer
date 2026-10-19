// Passt das von Capacitor erzeugte Android-Projekt ans Spiel an:
//   – Querformat (das Spielbild ist 960 × 540)
//   – Vollbild ohne Statusleiste, auch neben dem Kamera-Ausschnitt
//   – Programmsymbol: ein Fechter aus dem Spiel (erzeugt von npm run symbol, liegt in werkzeuge/android/res)
//   – Versionsname und -nummer (damit sich neue APKs über alte installieren lassen)
//   – fester Signierschlüssel werkzeuge/android/debug.keystore (sonst erzeugt Gradle je Build einen
//     neuen, und Android lehnt jedes Update mit „App nicht installiert“ ab)
// Die Änderungen sind reine Textersetzungen und lassen sich beliebig oft wiederholen.
import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHLUESSEL = fileURLToPath(new URL('./debug.keystore', import.meta.url));

// Hauptaktivität im Querformat (dreht sich mit, wenn man das Handy umdreht)
export function querformat(manifest) {
  if (manifest.includes('android:screenOrientation=')) {
    return manifest.replace(/android:screenOrientation="[^"]*"/, 'android:screenOrientation="sensorLandscape"');
  }
  return manifest.replace(/(<activity\b)/, '$1\n            android:screenOrientation="sensorLandscape"');
}

// App-Thema ohne Statusleiste; das Bild reicht auch in den Streifen neben dem Kamera-Ausschnitt
// (sonst bleibt dort im Querformat ein schwarzer Rand und das Spiel rutscht zur Seite)
export function vollbild(styles) {
  if (styles.includes('android:windowFullscreen')) return styles;
  return styles.replace(
    /(<style name="AppTheme\.NoActionBar"[^>]*>)/,
    '$1\n        <item name="android:windowFullscreen">true</item>' +
      '\n        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>',
  );
}

// Signiert Debug-Builds immer mit demselben Schlüssel. Der Standard-Debug-Schlüssel unter ~/.android
// wurde auf den GitHub-Runnern nicht gefunden – jeder Build bekam einen neuen, zufälligen Schlüssel.
export function festerSchluessel(gradle, pfad = SCHLUESSEL) {
  if (gradle.includes('signingConfigs')) return gradle;
  const datei = JSON.stringify(pfad.replaceAll('\\', '/'));
  return gradle
    .replace(
      /(android \{\n)/,
      `$1    signingConfigs {\n        debug {\n            storeFile file(${datei})\n            storePassword 'android'\n            keyAlias 'androiddebugkey'\n            keyPassword 'android'\n        }\n    }\n`,
    )
    .replace(/(buildTypes \{\n)/, '$1        debug {\n            signingConfig signingConfigs.debug\n        }\n');
}

// versionsCode: ganze Zahl, die bei jedem Build steigt; versionsName: lesbare Version wie „0.1.0“
export function version(gradle, { versionsName, versionsCode }) {
  let ergebnis = gradle;
  if (versionsCode) ergebnis = ergebnis.replace(/versionCode \d+/, `versionCode ${Number(versionsCode)}`);
  if (versionsName) ergebnis = ergebnis.replace(/versionName "[^"]*"/, `versionName "${versionsName}"`);
  return ergebnis;
}

function aendere(pfad, aenderung) {
  const vorher = readFileSync(pfad, 'utf8');
  const nachher = aenderung(vorher);
  if (nachher === vorher) console.warn(`Hinweis: ${pfad} blieb unverändert.`);
  writeFileSync(pfad, nachher);
}

export function passeAndroidAn(android, versionen = {}) {
  const app = join(android, 'app');
  aendere(join(app, 'src/main/AndroidManifest.xml'), querformat);
  aendere(join(app, 'src/main/res/values/styles.xml'), vollbild);
  // Programmsymbol: ersetzt die Capacitor-Symbole in allen Auflösungen
  cpSync(new URL('./res', import.meta.url), join(app, 'src/main/res'), { recursive: true });
  aendere(join(app, 'build.gradle'), (g) => festerSchluessel(version(g, versionen)));
}
