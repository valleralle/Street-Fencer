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

## Einstellungen

- **Inhalt:** Musik- und Effektlautstärke (in 10-%-Schritten) und die Tastenbelegung beider Spieler, je auf einer eigenen Seite. Dazu „Standard wiederherstellen“.
- **Gespeichert im Browser** (`localStorage`). In einem privaten Fenster oder wenn der Browser das Speichern verbietet, gelten die Einstellungen nur bis zum Neuladen – ohne Fehlermeldung.
- **Belegte Tasten werden getauscht:** Wählt man eine Taste, die schon eine andere Aktion hat (auch beim anderen Spieler), bekommt diese die bisherige Taste. So liegen nie zwei Aktionen auf einer Taste.
- **Reserviert:** Esc, P, Enter und Leertaste (Pause und Menüs) lassen sich nicht belegen.
- Eine eigene Option „Ton aus“ gibt es nicht – beide Lautstärken lassen sich auf 0 % stellen.

## Musik

- **Im Browser erzeugt** wie die Effekte, ohne Musikdateien: ein ruhiges Stück für Titel und Menüs (d-Moll) und ein treibendes für das Gefecht (a-Moll, mit Schlagzeug). Beide sind kurze Schleifen von vier Takten.
- Die Musik ist bewusst leise, damit Signalton und Klingengeräusche hörbar bleiben (Standard: Musik 50 %, Effekte 80 %).
- In der Pause läuft die Gefechtsmusik weiter; auf dem Siegerbildschirm wechselt sie zur Titelmusik.

## Getroffen, Jubel und Funken

- **Getroffen:** Nur bei einem einzelnen Treffer zuckt der Getroffene zurück. Bei Doppeltreffern zeigt niemand diese Pose (beide wären getroffen).
- **Jubel:** Sobald das Gefecht entschieden ist – auch durch Zeitablauf –, jubelt der Sieger mit hochgerecktem Degen. Auf dem Siegerbildschirm erscheint er groß in dieser Pose.
- **Funken** sprühen nur bei einer gelungenen Parade (wenn Klinge auf Klinge trifft), nicht bei Treffern. Ein Wackeln der Kamera bei Treffern habe ich nicht eingebaut, weil es nicht auf der Liste stand.

## Statistik

- Gezählt wird pro Fechter: **Angriffe** (jede Aktion, bei der die Klinge nach vorn schnellt – auch parierte), **Treffer** (auch solche in Doppeltreffern und gestrichene), davon **Riposten**, **gelungene Paraden**, **Doppeltreffer** und die **Trefferquote** (Treffer pro Angriff).
- Die Statistik gilt für ein Gefecht und wird bei der Revanche neu begonnen. Sie wird nicht dauerhaft gespeichert.
