# Annahmen

Beim selbstständigen Umsetzen von Flèche, Getroffen- und Jubelpose, Funken, Musik, Tutorial,
Statistik, Einstellungen und Regeltests (Branch `erweiterungen`) habe ich an diesen Stellen
selbst entschieden. Alles lässt sich ändern – sag einfach, was anders sein soll.

## Regeltests

- **Test-Runner von Node** (`node --test`) statt einer Bibliothek wie Vitest – es muss nichts installiert werden. Aufruf: `npm test`.
- Die Gefechte gegen den Computergegner laufen mit **festem Zufall**, damit die Tests immer gleich ausgehen. Geprüft wird die Rangfolge der Stufen, nicht exakte Prozentwerte.
- Damit die Spiellogik ohne Browser testbar ist, kann ein Fechter **ohne Szene** erzeugt werden (dann zeichnet er nichts), und die Abstandsregel liegt in `src/abstand.js`.

## Flèche

- **Eigene Taste:** Rot **R**, Grün **J** – nahe an den übrigen Tasten und ohne Überschneidung. Eine Tastenkombination wäre mit dem Ausfall (vorwärts + Stoß) verwechselbar gewesen.
- **Kein Vorbeistürmen:** Im echten Fechten läuft der Fechter am Gegner vorbei. Im Spiel würde das die Seiten tauschen (Blickrichtung, Startlinien, Kamera). Stattdessen bremst die Flèche wie der Ausfall am Gegner ab.
- **Zeiten:** 250 ms Antritt, 350 ms Sprint (650 px/s), danach 600 ms verwundbar. Sie trifft aus etwa 300 Pixeln, wo kein Ausfall mehr reicht.
- **Antworten:** Parade und Tiefstoß funktionieren beide mit menschlicher Reaktionszeit (siehe `test/fleche.test.js`).
- Der Computergegner setzt sie selten (nur aus mittlerer Distanz) ein und reagiert auf sie wie auf andere Angriffe.

## Pixelart

- Das Zeichenskript liegt jetzt im Projekt: `werkzeuge/pixelart-zeichnen.mjs` (`npm run pixelart:zeichnen`). Es **überschreibt** `src/pixelart/fechterPosen.js` – Pixel, die dort von Hand geändert wurden, gehen beim nächsten Zeichnen verloren.
- Neue Posen: **Flèche**, **getroffen** und **Jubel**.
