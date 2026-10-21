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
- **Zeiten:** 300 ms Antritt, 300 ms Sprint (450 px/s), danach 600 ms verwundbar. Sie trifft aus bis zu etwa 265 Pixeln – etwas weiter als der Ausfall (etwa 210).
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
- Die Musik bleibt unter den Effekten, damit Signalton und Klingengeräusche hörbar bleiben (Standard: Musik 50 %, Effekte 80 %). Nach Rückmeldungen vom Handy ist sie inzwischen gut fünfmal so laut wie zuerst (Grundpegel 0,22 → 0,33 → 0,66 → 1,19). Der Signalton bleibt bei Standard-Einstellung im Mittel gut doppelt so laut wie die Gefechtsmusik.
- In der Pause läuft die Gefechtsmusik weiter; auf dem Siegerbildschirm wechselt sie zur Titelmusik.

## Getroffen, Jubel und Funken

- **Getroffen:** Nur bei einem einzelnen Treffer zuckt der Getroffene zurück. Bei Doppeltreffern zeigt niemand diese Pose (beide wären getroffen).
- **Jubel:** Sobald das Gefecht entschieden ist – auch durch Zeitablauf –, jubelt der Sieger mit hochgerecktem Degen. Auf dem Siegerbildschirm erscheint er groß in dieser Pose.
- **Funken** sprühen nur bei einer gelungenen Parade (wenn Klinge auf Klinge trifft), nicht bei Treffern. Ein Wackeln der Kamera bei Treffern habe ich nicht eingebaut, weil es nicht auf der Liste stand.

## Statistik

- Gezählt wird pro Fechter: **Angriffe** (jede Aktion, bei der die Klinge nach vorn schnellt – auch parierte), **Treffer** (auch solche in Doppeltreffern und gestrichene), davon **Riposten**, **gelungene Paraden**, **Doppeltreffer** und die **Trefferquote** (Treffer pro Angriff).
- Die Statistik gilt für ein Gefecht und wird bei der Revanche neu begonnen. Sie wird nicht dauerhaft gespeichert.

## Training (Tutorial)

- **Eigener Modus** „Training“ ganz oben im Titelmenü, statt Hinweisen mitten im Gefecht. Man spielt Rot gegen einen **Trainer** (Grün), der entweder stillsteht oder in ruhigem Rhythmus (alle 2 Sekunden) mit einfachen Stößen angreift.
- **Sieben Lektionen:** Bewegen, Stoß, Ausfall, Parade, Riposte, Tiefstoß, Flèche. Eine Lektion ist geschafft, wenn man die verlangte Aktion erfolgreich ausführt (z. B. bei „Ausfall“ mit einem Ausfall trifft). Wer getroffen wird oder mit einer anderen Aktion trifft, bekommt einen Hinweis und versucht es noch einmal.
- Die Anleitungen zeigen die **aktuelle Tastenbelegung** aus den Einstellungen.
- Es gibt keine Punkte, keine Uhr und keine Pause – Esc führt jederzeit zurück zum Titel. Der Fortschritt wird nicht gespeichert.
- Den Trainingsmodus gibt es nur für Rot (die linke Tastaturhälfte).

## Finte

- **Bedienung:** Während des Ausholens die Stoß-Taste ein zweites Mal drücken. „Halten und loslassen“ hätte bedeutet, dass jeder normale Stoß 300 ms gedrückt werden muss.
- Geht beim **Stoß und Ausfall**, nicht bei Flèche und Riposte. Nach dem Abbruch ist man sofort wieder frei und kann wirklich zustoßen.
- **Nebenwirkung:** Wer wild auf die Stoß-Taste hämmert, macht ungewollt Finten – sein Angriff bricht ab. Das bestraft Hämmern bewusst.
- **Computergegner:** „Mittel“ durchschaut 40 % der Finten, „Schwer“ 80 % (er pariert dann erst kurz bevor die Klinge ankommt). „Mittel“ täuscht in 15 % seiner Stöße selbst, „Schwer“ in 30 %, „Leicht“ nie.
- **Training:** neue Lektion „Finte“ gegen einen Trainer, der jeden Angriff sofort pariert.

## Name und .exe

- **Neuer Name „Street Fencer“** im Titelbildschirm, Browser-Tab, README, Glossar und `package.json` (`street-fencer`). Das GitHub-Repo heißt inzwischen `Street-Fencer` (Browser-Adresse https://valleralle.github.io/Street-Fencer/); der lokale Projektordner kann weiter `game_pilot` heißen.
- Der **Speicherschlüssel der Einstellungen** heißt `street-fencer.einstellungen`. Einstellungen unter dem alten Schlüssel `game_pilot.einstellungen` werden beim ersten Start übernommen, dann wird der alte Schlüssel gelöscht. Die Entscheidungsnotiz ADR 0001 nennt „Street Fencer (damals game_pilot)“.
- **.exe mit eingebautem Node** (Node „Single Executable Application“): Sie enthält das gebaute Spiel, startet einen kleinen Webserver nur auf diesem Rechner (`127.0.0.1`) und öffnet den Standardbrowser. Deshalb ist sie etwa 90 MB groß.
- **Feste Adresse** `http://127.0.0.1:41730`, weil der Browser Einstellungen pro Adresse speichert. Ein zweiter Start öffnet nur das laufende Spiel.
- Die .exe ist **nicht signiert** – Windows SmartScreen kann beim ersten Start warnen. Ihr Programmsymbol ist derselbe rote Fechter wie im Browser-Tab und in der Android-App (`npm run symbol`).
- `release/` steht in `.gitignore`: Die .exe wird nicht ins Repo eingecheckt (zu groß), sondern mit `npm run exe` gebaut.

## Handy und Android-App

- **Touch-Knöpfe** erscheinen nur, wenn der Touchscreen die Hauptbedienung ist (Handy, Tablet). Laptops mit Touchscreen behalten die Tastatur. Die Knöpfe gibt es nur im Gefecht **gegen den Computer** – für zwei Spieler auf einem Handy wäre zu wenig Platz.
- **Belegung:** links ◀ ▶ zum Gehen, rechts Stoß (groß), daneben ganz unten Parade und Tief, darüber Flèche. Ausfall = ▶ halten + Stoß, wie an der Tastatur. Die Knöpfe reagieren etwas großzügiger als ihr Kreis.
- **Auf dem Handy ausgeblendet:** „2 Spieler“ im Titelmenü und die Tastenbelegung in den Einstellungen. Lautstärke: links antippen = leiser, rechts = lauter.
- **Training auf dem Handy:** mit denselben Knöpfen wie im Gefecht; die Anleitungen nennen dann die Knöpfe („Tippe „Parade““) statt der Tasten. Oben rechts „Zurück“ führt zum Titel.
- Menüs lassen sich jetzt überall **antippen oder anklicken**, auch am PC.
- **Ganzer Bildschirm:** Auf Handy und Tablet wird das Spielbild breiter bzw. höher als 16:9 (Phaser-Modus EXPAND, siehe `src/bildschirm.js`). Die 960 × 540 liegen mittig, am Rand ist mehr Halle zu sehen, die Knöpfe bleiben in den Ecken. Am Computer bleibt es bei 16:9 mit Rand.
- **Android-App:** ohne Statusleiste und bis in den Kamera-Ausschnitt; das Programmsymbol ist der rote Fechter im Ausfall.
- **Im Hintergrund stumm:** Wer die App oder den Tab verlässt, hört nichts mehr (`src/hintergrund.js`); ein laufendes Gefecht wartet beim Zurückkommen im Pausenmenü.
- Im **Hochformat** erscheint ein Hinweis, das Handy zu drehen. Im Browser versucht das Spiel beim ersten Antippen in den Vollbildmodus zu wechseln (klappt nicht in jedem Browser, z. B. nicht auf dem iPhone).
- **Android-App** mit Capacitor 8, App-ID `de.valleralle.streetfencer`, fest im Querformat und ohne Statusleiste. Es ist eine **Debug-APK** – zum Selbstinstallieren gedacht, nicht für den Play Store.
- `package-lock.json` enthält Capacitor noch nicht (ich konnte hier kein npm ausführen). Die Workflows nutzen deshalb `npm install` statt `npm ci`; beim nächsten lokalen `npm install` wird die Lock-Datei ergänzt – die bitte einchecken.

## Ziffern (Issue #8)

- In Pixelify Sans sahen 5 und 2 wie S und Z aus. Die Ziffern 0–9 und der Doppelpunkt kommen jetzt aus einer **eigenen kleinen Schrift** im selben 5 × 7-Raster und mit denselben Abständen. Sie ist in `index.html` als Teil der Schriftfamilie „Pixelify Sans“ nur für diese Zeichen eingebunden – so gilt sie für **jede Zahl im Spiel** (Punktestand, Uhr, Statistik, Lektionsnummer, Lautstärke), ohne dass ein Bildschirm geändert werden musste.
- Die 5 hat einen geraden, eckigen Kopf, die 2 einen runden Bogen. Vorschau: `grafik/ziffern-vorschau.png`.

## Flèche gegen den Computer (Issue #10)

- Ursache, warum stur nur Flèchen fast immer gewann: Der Computer griff während der anlaufenden Flèche oft selbst an (und konnte dann nicht parieren), und er plante seine Parade fest zum Zeitpunkt der ersten Schätzung – lief er der Flèche entgegen, kam sie früher.
- Jetzt: Bei einer anlaufenden Flèche greift er nicht an und geht nicht vor; die Ankunft wird in jedem Bild neu geschätzt. Schätzt er falsch ein, weicht er nach seiner Reaktionszeit zurück (aus der Nähe sticht er wie bisher manchmal zurück).
- Die Flèche selbst ist unverändert – auch für 2 Spieler. Der Test `test/fleche-balance.test.js` hält fest: stur nur Flèchen ist gegen keine Stufe mehr als 15 Prozentpunkte besser als stur nur Stöße.

## Spielweisen des Computers (Issue #13)

- **Spielweisen:** *Angreifen* (wie bisher), *Abwarten* (knapp außerhalb der Reichweite, auf Angriffe antworten) und *Distanz halten* (weiter weg, zurückweichen, nur Gelegenheiten nutzen). Dazu *Gleichzeitig* – nur in Führung: nah dranbleiben und in die Vorbereitung des Gegners hinein angreifen, damit es einen Doppeltreffer gibt.
- **Wahl:** alle 2–6 Sekunden und nach jedem Treffer. Mit der Wahrscheinlichkeit `taktik` (Leicht 0,15, Mittel 0,55, Schwer 0,95) nach Stand und Restzeit – vorne eher abwarten bzw. auf Doppeltreffer spielen, vorne mit wenig Zeit auf Zeit spielen, hinten angreifen –, sonst nach Charakter. Wer wenig taktisch ficht (Leicht), greift eher planlos an.
- **Doppeltreffer-Taktik** nie bei 4:4 und nie in der Verlängerung (dort würde ein Doppeltreffer gestrichen). Im Rückstand stößt Schwer nicht mehr blind zurück. Weil er im Rückstand aber mehr angreift, entstehen gegen einen angriffslustigen Spieler im Rückstand trotzdem viele Doppeltreffer – das Ticket wollte beides (mehr angreifen, Doppeltreffer meiden), was sich gegen so einen Spieler nicht ganz verträgt.
- **Geduld:** Wartet er vergeblich auf einen Angriff, greift er selbst an (Angreifer nach 2,5 s, Taktiker 5 s, Konterfechter 8 s); an der eigenen Endlinie wartet er nie.
- **Charakter** pro Gefecht zufällig: Angreifer, Konterfechter oder Taktiker – oben links angezeigt („Grün: Konterfechter“).
- **Schwer** reagiert jetzt nach 145 statt 150 ms und antwortet zu 93 statt 92 % richtig – sonst wäre er durch die neuen Spielweisen kaum noch stärker als Mittel gewesen.

## Sprachen (Issue #12)

- **Deutsch und Englisch.** Alle sichtbaren Texte stehen in `src/texte.js`; die Bildschirme holen sie über `text()`. Englische Fachbegriffe wie im englischsprachigen Fechten (épée, touch, lunge, parry, flèche, piste, scoring box, priority …), siehe auch `CONTEXT.md`. Das Kommando „En garde – Prêts ? – Allez !“ bleibt französisch.
- **Erster Start:** Spricht der Browser Englisch, startet das Spiel auf Englisch, sonst auf Deutsch. In den Einstellungen lässt sich die Sprache jederzeit wechseln (wird gespeichert); „Standard wiederherstellen“ lässt die Sprache, wie sie ist.
- **„fi“:** Pixelify Sans macht aus „fi“ ein Zeichen, das wie „A“ aussieht. `text()` setzt zwischen f und i ein unsichtbares Trennzeichen (Zero Width Non-Joiner); so steht „fight“, „first“, „finish“ richtig da.
- Der Trainer heißt auf Englisch „the coach“ – ohne „he/she“.

## Signatur der Android-App (v0.2.1)

- Bis 0.2.0 fand Gradle auf den GitHub-Runnern den Debug-Schlüssel unter `~/.android` nicht und erzeugte bei jedem Build einen neuen – jede APK war anders signiert, Updates schlugen mit „App nicht installiert“ fehl. Jetzt trägt `werkzeuge/android/anpassen.mjs` den Schlüssel `werkzeuge/android/debug.keystore` direkt in die Gradle-Konfiguration ein, und der Android-Workflow bricht ab, wenn eine APK anders signiert ist.
- Wer eine ältere APK installiert hat, muss einmal deinstallieren.


## Mensur des Computers (Issue #22)

- **Verzögert:** Der Computer sieht die Bewegung des Gegners erst nach seiner Reaktionszeit (Leicht 400, Mittel 260, Schwer 145 ms) und zieht erst nach, wenn die Mensur mehr als seine Toleranz von seinem Wunsch abweicht (Leicht 30, Mittel 18, Schwer 8 px) – dann bis zum Wunschabstand. Geht man auf ihn zu, schrumpft die Mensur so um mindestens 80/50/28 px, bevor er zurückweicht.
- **Vorausschau:** Eine Bewegung, die er schon sieht, rechnet er ein Stück weiter (`antizipation` Leicht 0,4, Mittel 0,6, Schwer 0,9). Ohne sie lief er in einen gleichmäßig herankommenden Gegner hinein, weil er ihn noch weit weg sah – vor allem Schwer wurde dadurch schwächer als Mittel. Einen plötzlichen Antritt oder Richtungswechsel bemerkt er trotzdem erst nach seiner Reaktionszeit.
- **Balance:** Wer stur vorgeht und stößt, gewinnt jetzt öfter (Stoß-Spammer gegen Leicht/Mittel/Schwer etwa 83/70/33 % statt 65/39/30 %) – genau das ist der Effekt des Tickets: man kann ihm die Mensur stehlen. Die Rangfolge der Stufen und die Flèche-Balance bleiben, alle bisherigen Tests sind grün.

## Wiederholung am Gefechtsende (Issue #29)

- Aufgezeichnet werden die letzten 3 Sekunden Spielzeit; abgespielt werden die 2 Sekunden vor dem entscheidenden Treffer und der kurze Nachlauf danach, mit 35 % Tempo (gut 6 Sekunden). Danach bleibt das letzte Bild 0,8 Sekunden stehen, dann kommt der Siegerbildschirm.
- Die Beschriftung zählt die Aktionen bis zum Treffer auf („Rot: Finte → Ausfall“). Ein abgebrochener Angriff erscheint als „Finte“; wer nichts getan hat, bekommt „keine Aktion“.
- Überspringen: Antippen, Enter, Esc oder P (P ist sonst Pause – während der Wiederholung gibt es keine Pause).

## Wertungszahl (Issue #26)

- Elo-Formel mit K = 32; Start 1000, Computer Leicht 900, Mittel 1200, Schwer 1500. Gewertet wird jedes Gefecht gegen den Computer (auch Revanchen), nicht der Modus 2 Spieler.
- **Ränge:** Anfänger unter 1050, Vereinsfechter ab 1050, Landesklasse ab 1200, Bundesklasse ab 1350, Meister ab 1500. Meister wird also nur, wer Schwer regelmäßig schlägt.
- **Trefferquote** auf dem Bildschirm „Fortschritt“ ist der Anteil der eigenen an allen Treffern der letzten 20 Gefechte (die Trefferquote im Gefecht – Treffer je Angriff – wird nicht gespeichert).
- Der Verlauf (Datum, Stufe, Sieg, Treffer, Gegentreffer, Wertung danach) liegt unter `street-fencer.wertung`; kaputte Einträge werden beim Laden verworfen.

## Erfolge (Issue #23)

- 15 Erfolge in vier Gruppen: **Erste Schritte** (erster Treffer, erster Sieg, Training abgeschlossen), **Technik** (Sieg mit Riposte als letztem Treffer, Treffer nach Finte, Tiefstoß-Treffer gegen Schwer, 10 parierte Flèchen, 25 Riposten-Treffer), **Leistung** (Sieg gegen Schwer, 5:0 gegen Schwer, Sieg in der Verlängerung, Sieg nach 0:3) und **Ausdauer** (10/50/100 Gefechte gegen den Computer).
- Es zählen nur Gefechte gegen den Computer (der Spieler ist Rot) und das Training. „Sieg nach 0:3“ heißt: irgendwann drei Treffer hinten gelegen. „Treffer nach Finte“: ein Treffer bis eine Sekunde nach einer Finte (wie in der Lektion).
- Gespeichert unter `street-fencer.erfolge`: wann jeder Erfolg erreicht wurde und die Zähler (Gefechte, parierte Flèchen, Riposten). `hatErfolg(id)` fragt das für spätere Freischaltungen (#28) ab.
- Nebenbei: Pixelify Sans macht auch aus „fl“ ein Zeichen wie „A“ (z. B. „flèche“ im englischen Text); `text()` trennt jetzt auch „fl“.
