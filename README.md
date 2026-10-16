# game_pilot

2D-Fechtspiel für den Browser nach den Regeln des Degenfechtens – gebaut mit [Phaser](https://phaser.io) und [Vite](https://vitejs.dev).

Zwei Fechter stehen sich auf der Fechtbahn gegenüber. Jeder Treffer bringt einen Punkt, wer zuerst 5 Treffer hat, gewinnt. Begriffe und Regeln stehen in [CONTEXT.md](CONTEXT.md), wichtige Entscheidungen in [docs/adr/](docs/adr/), meine Annahmen beim selbstständigen Umsetzen in [ANNAHMEN.md](ANNAHMEN.md).

## Starten

```bash
npm install
npm run dev
```

Dann die angezeigte Adresse (meist http://localhost:5173) im Browser öffnen.

## Tests

```bash
npm test
```

Prüft die Spielregeln ohne Browser: Schlagabtausch mit menschlicher Reaktionszeit, Flèche, Gefecht (Punkte, Zeit, Verlängerung), Abstandsregel, Computergegner, Training, Statistik, Einstellungen, Funken und Musik.

## Steuerung (Standard)

| Spieler           | links | rechts | Stoß | Parade | Tiefstoß | Flèche |
|-------------------|-------|--------|------|--------|----------|--------|
| 1 (Rot, links)    | A     | D      | F    | G      | S        | R      |
| 2 (Grün, rechts)  | ←     | →      | K    | L      | ↓        | J      |

- **Ausfall** = vorwärts + Stoß
- **Riposte** = Stoß direkt nach einer gelungenen Parade
- **Pause** = Esc oder P
- Die Tasten lassen sich unter **Einstellungen** ändern.

Menüs bedienst du mit ↑ / ↓ (oder W / S) und Enter, Werte änderst du mit ← / → (oder A / D).

## Was es gibt

- **Training:** sieben Lektionen gegen einen Trainer – Bewegen, Stoß, Ausfall, Parade, Riposte, Tiefstoß, Flèche
- **2 Spieler** an einer Tastatur oder **gegen den Computer** (leicht, mittel, schwer); gegen den Computer spielst du Rot
- **Gefecht** mit Punkten, Doppeltreffern, Kommando, 3 Minuten Zeit und Verlängerung mit Vorteil
- **Meldegerät** mit Lampen und Signalton, Zeitlupe bei Treffern, Funken bei Paraden, Getroffen- und Jubelpose
- **Siegerbildschirm** mit Statistik (Angriffe, Treffer, Riposten, Paraden, Doppeltreffer, Trefferquote) und Revanche
- **Musik** für Titel und Gefecht, Klingengeräusche – alles im Browser erzeugt, ohne Audiodateien
- **Einstellungen:** Lautstärke von Musik und Effekten, Tastenbelegung – im Browser gespeichert

## Struktur

- `index.html` – Einstiegsseite
- `src/main.js` – Phaser-Konfiguration
- `src/szenen/` – Bildschirme: Titel, Training, Stufen, Steuerung, Einstellungen, Tasten, Kampf, Pause, Sieger
- `src/Fechter.js` – ein Fechter mit seinen Aktionen
- `src/Gefecht.js` – Regeln eines Gefechts (Punkte, Zeit, Verlängerung)
- `src/abstand.js` – die Fechter berühren sich nicht und bleiben zwischen den Endlinien
- `src/Computergegner.js` – der Computergegner; Stärke der Stufen in `STUFEN`
- `src/Trainer.js`, `src/lektionen.js` – Gegner und Lektionen des Trainings
- `src/Statistik.js` – zählt mit, was im Gefecht passiert
- `src/einstellungen.js` – Lautstärken und Tastenbelegung
- `src/steuerung.js` – Tastatursteuerung eines Fechters
- `src/Menue.js` – Menü für alle Bildschirme
- `src/kulisse.js` – Halle und Fechtbahn
- `src/Kamera.js` – Kamera, die nah dran ist und den Fechtern folgt
- `src/Meldegeraet.js` – Lampen, Punktestand und Uhr
- `src/Funken.js` – Funken bei der Parade
- `src/klang.js` – Effekte (Signalton, Klingenschlag, Luftzug), `src/musik.js` – Musik
- `src/farben.js` – die Farben der Fechter
- `src/schrift.js`, `public/schrift/` – Pixelschrift „Pixelify Sans“ (OFL-Lizenz)
- `src/pixelart/fechterPosen.js` – die Pixelbilder der Fechter als Textraster
- `werkzeuge/pixelart-zeichnen.mjs` – zeichnet die Posen (`npm run pixelart:zeichnen`; überschreibt `fechterPosen.js`)
- `grafik/` – daraus erzeugte PNGs; neu erzeugen mit `npm run pixelart`
- `test/` – Tests (`npm test`)
- `CONTEXT.md` – Glossar der Fachbegriffe
- `docs/adr/` – Entscheidungsnotizen

## Fahrplan

1. Zwei Fechter auf der Fechtbahn, Vor-/Zurückschritt ✅
2. Stoß, Ausfall, Parade, Riposte, Tiefstoß und Treffererkennung ✅
3. Gefecht: Punkte, Doppeltreffer, Startlinien und Kommando, Zeit, Verlängerung mit Vorteil ✅
4. Trefferanzeige mit Lampen, Signalton und Zeitlupe ✅
5. Titelbildschirm, Steuerungsübersicht, Pause, Siegerbildschirm mit Revanche ✅
6. Computergegner (leicht, mittel, schwer) ✅
7. Grafik: Fechter, Fechtbahn, Halle, Meldegerät und Schrift als Pixelart · Klingengeräusche ✅
8. Flèche, Getroffen- und Jubelpose, Funken, Musik, Training, Statistik, Einstellungen, Regeltests ✅
9. Später: Sprachansagen, Finte, Battement, Karten und Strafen, Turniermodus
