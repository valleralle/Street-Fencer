import { test } from 'node:test';
import assert from 'node:assert/strict';
import { querformat, vollbild, version, festerSchluessel } from '../werkzeuge/android/anpassen.mjs';
import { faelligesRelease, notizenDatei, tagsAus } from '../werkzeuge/android/release.mjs';

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

test('ein Release ist fällig, wenn die Version neu ist und Release-Notizen vorliegen', () => {
  const tags = ['v0.1.0', 'v0.2.0', 'v0.3.0'];
  assert.deepEqual(faelligesRelease({ version: '0.4.0', vorhandeneTags: tags, notizenVorhanden: true }), { tag: 'v0.4.0', grund: null });
  assert.equal(faelligesRelease({ version: '0.3.0', vorhandeneTags: tags, notizenVorhanden: true }).tag, null);
  assert.equal(faelligesRelease({ version: '0.4.0', vorhandeneTags: tags, notizenVorhanden: false }).tag, null);
  assert.equal(notizenDatei('v0.4.0'), 'docs/releases/v0.4.0.md');
});

test('die Tags werden aus git ls-remote gelesen', () => {
  const ausgabe = 'abc\trefs/tags/v0.1.0\ndef\trefs/tags/v0.2.0\nghi\trefs/tags/v0.2.0^{}\n';
  assert.deepEqual(tagsAus(ausgabe), ['v0.1.0', 'v0.2.0']);
  assert.deepEqual(tagsAus(''), []);
});
