import { test } from 'node:test';
import assert from 'node:assert/strict';
import { querformat, vollbild, version, festerSchluessel } from '../werkzeuge/android/anpassen.mjs';

const MANIFEST = `<application>
        <activity
            android:name=".MainActivity"
            android:exported="true">
        </activity>
    </application>`;

test('Android-App läuft im Querformat', () => {
  const ergebnis = querformat(MANIFEST);
  assert.match(ergebnis, /android:screenOrientation="sensorLandscape"/);
  // Ein zweiter Durchlauf ändert nichts mehr
  assert.equal(querformat(ergebnis), ergebnis);
});

test('Android-App läuft im Vollbild', () => {
  const styles = '<resources>\n    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">\n    </style>\n</resources>';
  const ergebnis = vollbild(styles);
  assert.match(ergebnis, /<item name="android:windowFullscreen">true<\/item>/);
  assert.match(ergebnis, /<item name="android:windowLayoutInDisplayCutoutMode">shortEdges<\/item>/);
  assert.equal(vollbild(ergebnis), ergebnis);
});

test('Versionsname und -nummer landen im Gradle-Build', () => {
  const gradle = 'defaultConfig {\n        versionCode 1\n        versionName "1.0"\n    }';
  const ergebnis = version(gradle, { versionsName: '0.2.0', versionsCode: '17' });
  assert.match(ergebnis, /versionCode 17/);
  assert.match(ergebnis, /versionName "0\.2\.0"/);
  assert.equal(version(gradle, {}), gradle);
});

test('Debug-Builds werden immer mit dem Schlüssel aus dem Repo signiert', () => {
  const gradle = "android {\n    namespace = 'x'\n    buildTypes {\n        release {\n        }\n    }\n}";
  const ergebnis = festerSchluessel(gradle, '/repo/werkzeuge/android/debug.keystore');
  assert.match(ergebnis, /signingConfigs \{\n\s+debug \{\n\s+storeFile file\("\/repo\/werkzeuge\/android\/debug\.keystore"\)/);
  assert.match(ergebnis, /keyAlias 'androiddebugkey'/);
  assert.match(ergebnis, /buildTypes \{\n\s+debug \{\n\s+signingConfig signingConfigs\.debug/);
  // Ein zweiter Durchlauf ändert nichts mehr
  assert.equal(festerSchluessel(ergebnis), ergebnis);
});
