# Eine Codebasis für alle Plattformen

Street Fencer soll im Browser am PC, im Browser auf dem Handy, als Android-App und später vielleicht als iOS-App laufen. Wir halten dafür **eine einzige Codebasis** (`src/`) und bauen daraus alle Versionen, statt pro Plattform eigene Projekte oder Branches zu pflegen.

- **Browser (PC und Handy)** sind derselbe Build. Das Spiel erkennt beim Start, ob es auf einem Gerät mit Touchscreen als Hauptbedienung läuft (`src/touch.js`), und zeigt dann Knöpfe am Bildschirm. Veröffentlicht wird über GitHub Pages (`.github/workflows/web.yml`).
- **Android** verpackt denselben Build mit [Capacitor](https://capacitorjs.com) in eine App (`npm run android`, `.github/workflows/android.yml`). Das native Projekt `android/` wird bei jedem Build neu erzeugt und nicht eingecheckt; die wenigen Anpassungen (Querformat, Vollbild, Version) macht `werkzeuge/android/anpassen.mjs`.
- **Windows (.exe)** bleibt wie bisher (`npm run exe`).
- **iOS (später)** geht genauso: `@capacitor/ios` ergänzen, `npx cap add ios`, und auf einem macOS-Runner bauen. Für die Installation auf iPhones braucht es ein Apple-Developer-Konto (99 $/Jahr); ohne dieses ist nur der Browser auf dem iPhone möglich.

## Folgen

- Eine Spielregel oder ein Grafikfix wirkt sofort überall; es gibt keine Versionen, die auseinanderlaufen.
- Was nur eine Plattform betrifft, wird im Code abgefragt (z. B. Touch-Knöpfe) oder im jeweiligen Bauwerkzeug unter `werkzeuge/` erledigt – nicht in eigenen Kopien des Spiels.
- Sobald die Android-App mehr native Anpassungen braucht (Icons, Plugins, Store-Einstellungen), sollte `android/` eingecheckt werden, statt die Änderungen per Skript einzuspielen.
- Die APK ist mit einem **festen Debug-Schlüssel** signiert (`werkzeuge/android/debug.keystore`, öffentlich im Repo), damit sich neue Versionen über alte installieren lassen. Für den Play Store braucht es stattdessen einen geheimen Release-Schlüssel als GitHub-Secret.
