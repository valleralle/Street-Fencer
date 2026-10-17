// Baut die Android-App (APK) mit Capacitor: das gebaute Spiel (dist/) in einer Android-Hülle.
// Aufruf: npm run android
// Voraussetzungen: Java 21 und das Android-SDK (ANDROID_HOME). Auf GitHub erledigt das der
// Workflow .github/workflows/android.yml – lokal braucht man das nur, wenn man selbst bauen will.
//
// Ablauf: Spiel bauen → Android-Projekt erzeugen (falls es noch fehlt) → anpassen → Gradle-Build.
// Ergebnis: android/app/build/outputs/apk/debug/app-debug.apk
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { passeAndroidAn } from './anpassen.mjs';

const PROJEKT = resolve(import.meta.dirname, '../..');
const ANDROID = join(PROJEKT, 'android');
const windows = process.platform === 'win32';

const fuehreAus = (befehl, cwd = PROJEKT) => execSync(befehl, { cwd, stdio: 'inherit' });

console.log('1/4 Spiel bauen …');
fuehreAus('npm run build');

if (!existsSync(ANDROID)) {
  console.log('2/4 Android-Projekt erzeugen …');
  fuehreAus('npx cap add android');
} else {
  console.log('2/4 Android-Projekt ist schon da.');
}

console.log('3/4 Spieldateien übernehmen und Projekt anpassen …');
fuehreAus('npx cap sync android');
passeAndroidAn(ANDROID, {
  versionsName: process.env.VERSIONS_NAME,
  versionsCode: process.env.VERSIONS_CODE,
});

console.log('4/4 APK bauen …');
fuehreAus(windows ? 'gradlew.bat assembleDebug' : './gradlew assembleDebug', ANDROID);

console.log('\nFertig: android/app/build/outputs/apk/debug/app-debug.apk');
