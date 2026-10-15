# game_pilot

2D-Fechtspiel für den Browser nach den Regeln des Degenfechtens – gebaut mit [Phaser](https://phaser.io) und [Vite](https://vitejs.dev).

Zwei Fechter stehen sich auf der Fechtbahn gegenüber. Jeder Treffer bringt einen Punkt, wer zuerst 5 Treffer hat, gewinnt. Begriffe und Regeln stehen in [CONTEXT.md](CONTEXT.md), wichtige Entscheidungen in [docs/adr/](docs/adr/).

## Starten

```bash
npm install
npm run dev
```

Dann die angezeigte Adresse (meist http://localhost:5173) im Browser öffnen.

## Steuerung

| Spieler           | links | rechts | Stoß | Parade | Tiefstoß |
|-------------------|-------|--------|------|--------|----------|
| 1 (Rot, links)    | A     | D      | F    | G      | S        |
| 2 (Grün, rechts)  | ←     | →      | K    | L      | ↓        |

- **Ausfall** = vorwärts + Stoß
- **Riposte** = Stoß direkt nach einer gelungenen Parade
- **Pause** = Esc oder P

Menüs bedienst du mit ↑ / ↓ (oder W / S) und Enter.

Bisher eingebaut: das komplette Spiel zu zweit oder gegen den Computer (leicht, mittel, schwer) – Titel, Steuerungsübersicht, Gefecht mit Punkten, Zeit und Verlängerung, Trefferanzeige, Pause und Siegerbildschirm mit Revanche. Gegen den Computer spielst du Rot.

## Struktur

- `index.html` – Einstiegsseite
- `src/main.js` – Phaser-Konfiguration
- `src/szenen/` – Bildschirme: Titel, Steuerung, Kampf, Pause, Sieger
- `src/Fechter.js` – ein Fechter mit seinen Aktionen
- `src/Gefecht.js` – Regeln eines Gefechts (Punkte, Zeit, Verlängerung)
- `src/Computergegner.js` – der Computergegner; Stärke der Stufen in `STUFEN`
- `src/steuerung.js` – Tastatursteuerung eines Fechters
- `src/Menue.js` – Menü für Titel, Pause und Sieger
- `src/kulisse.js` – Halle und Fechtbahn
- `src/Kamera.js` – Kamera, die nah dran ist und den Fechtern folgt
- `src/Meldegeraet.js` – Lampen, Punktestand und Uhr
- `src/klang.js` – alle Töne (Signalton, Klingenschlag, Luftzug), im Browser erzeugt
- `src/schrift.js`, `public/schrift/` – Pixelschrift „Pixelify Sans“ (OFL-Lizenz)
- `src/pixelart/fechterPosen.js` – die Pixelbilder der Fechter als Textraster (hier kannst du jeden Pixel ändern)
- `grafik/` – daraus erzeugte PNGs; neu erzeugen mit `npm run pixelart`
- `werkzeuge/` – Hilfsskripte
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
8. Später: Flèche, Getroffen- und Jubelpose, Sprachansagen
