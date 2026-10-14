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
- **Pause** = Esc

Menüs bedienst du mit ↑ / ↓ (oder W / S) und Enter.

Bisher eingebaut: das komplette Spiel zu zweit – Titel, Steuerungsübersicht, Gefecht mit Punkten, Zeit und Verlängerung, Trefferanzeige, Pause und Siegerbildschirm mit Revanche. Der Computergegner fehlt noch.

## Struktur

- `index.html` – Einstiegsseite
- `src/main.js` – Phaser-Konfiguration
- `src/szenen/` – Bildschirme: Titel, Steuerung, Kampf, Pause, Sieger
- `src/Fechter.js` – ein Fechter mit seinen Aktionen
- `src/Gefecht.js` – Regeln eines Gefechts (Punkte, Zeit, Verlängerung)
- `src/Menue.js` – Menü für Titel, Pause und Sieger
- `CONTEXT.md` – Glossar der Fachbegriffe
- `docs/adr/` – Entscheidungsnotizen

## Fahrplan

1. Zwei Fechter auf der Fechtbahn, Vor-/Zurückschritt ✅
2. Stoß, Ausfall, Parade, Riposte, Tiefstoß und Treffererkennung ✅
3. Gefecht: Punkte, Doppeltreffer, Startlinien und Kommando, Zeit, Verlängerung mit Vorteil ✅
4. Trefferanzeige mit Lampen, Signalton und Zeitlupe ✅
5. Titelbildschirm, Steuerungsübersicht, Pause, Siegerbildschirm mit Revanche ✅
6. Computergegner (leicht, mittel, schwer)
7. Grafik: weiße Fechter mit roten/grünen Schuhen; Klingengeräusche
8. Später: Flèche, Pixelart, Sprachansagen
