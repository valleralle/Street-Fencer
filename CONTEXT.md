# Street Fencer

Ein 2D-Fechtspiel für den Browser nach den Regeln des Degenfechtens: zwei Fechter stehen sich auf einer Fechtbahn gegenüber, und jeder gültige Treffer bringt einen Punkt.

## Sprache

Zu jedem Begriff steht der englische Fachbegriff, wie ihn das Spiel auf Englisch verwendet (siehe `src/texte.js`). Das Kommando bleibt in beiden Sprachen französisch.

### Kampf

**Degen**:
Die einzige Waffe im Spiel – eine Stoßwaffe, mit der nur mit der Spitze getroffen wird.
_Vermeiden_: Schwert, Klinge (als Waffenname), Florett, Säbel
_Englisch_: épée

**Treffer**:
Ein gültiger Stoß mit der Degenspitze auf den Gegner; er bringt dem Stoßenden einen Punkt.
_Vermeiden_: Schaden, Hit, Schlag
_Englisch_: touch

**Trefffläche**:
Der Bereich des Gegners, auf dem ein Treffer zählt – beim Degen der ganze Körper vom Kopf bis zum Fuß, beim Ausfall also auch der weit vorgestellte vordere Fuß.
_Vermeiden_: Hitbox (als Fachbegriff im Spiel)
_Englisch_: target area

**Doppeltreffer**:
Zwei Treffer, die so kurz nacheinander landen, dass sie als gleichzeitig gelten; beide Fechter bekommen einen Punkt. Beim entscheidenden Treffer wird ein Doppeltreffer gestrichen.
_Vermeiden_: Unentschieden, Gleichzeitiger Treffer
_Englisch_: double touch

**Entscheidender Treffer**:
Ein Treffer, mit dem das Gefecht entschieden wäre – beim Stand von 4:4 oder in der Verlängerung.
_Vermeiden_: Matchball, Siegtreffer
_Englisch_: deciding touch

**Trefferanzeige**:
Die zwei Lampen im Meldegerät in den Farben der Fechter, von denen jede mit einem Signalton den Treffer eines Fechters meldet; bei einem Doppeltreffer leuchten beide.
_Vermeiden_: Anzeige, Lampe (allein), Scoreboard
_Englisch_: scoring lights

### Aktionen

**Grundstellung**:
Die Fechtstellung, in der ein Fechter steht, wenn er gerade keine Aktion ausführt – leicht in den Knien, Degen nach vorn.
_Vermeiden_: Idle, Ruhestellung, En garde (das ist das Kommando)
_Englisch_: en-garde position

**Offen**:
Der kurze Zustand nach einer gegnerischen Parade, in dem ein Fechter keine Aktion beginnen kann und für eine Riposte ungeschützt ist.
_Vermeiden_: Betäubt, Stun
_Englisch_: open

**Stoß**:
Ein schneller Angriff mit der Degenspitze aus dem Stand, mit kurzer Reichweite.
_Vermeiden_: Angriff (zu allgemein), Hieb, Schlag
_Englisch_: thrust

**Ausfall**:
Ein großer Schritt nach vorn mit Stoß – weite Reichweite, danach ist der Fechter kurz verwundbar.
_Vermeiden_: Sprungangriff, Lunge
_Englisch_: lunge

**Parade**:
Das Wegschlagen der gegnerischen Klinge; gelingt sie, ist der Gegner kurz offen.
_Vermeiden_: Block, Abwehr
_Englisch_: parry

**Riposte**:
Ein Gegenstoß direkt nach einer gelungenen Parade, schneller als ein normaler Stoß.
_Vermeiden_: Konter
_Englisch_: riposte

**Finte**:
Ein angetäuschter Angriff: Der Fechter holt aus und bricht ab, bevor er zustößt, um eine Parade herauszulocken und dann wirklich zu treffen.
_Vermeiden_: Täuschung, Fake
_Englisch_: feint

**Tiefstoß**:
Der Fechter duckt sich unter einem hohen Stoß weg und stößt dabei zum Fuß des Gegners. Riskant, aber auch als Antwort auf eine Flèche gedacht.
_Vermeiden_: Ducken (allein), Fußstoß
_Englisch_: low thrust

**Flèche**:
Ein Sturmangriff im Laufen mit gestreckter Klinge, der aus mittlerer Distanz trifft; wer ihn verfehlt, ist lange verwundbar.
_Vermeiden_: Sturm, Dash
_Englisch_: flèche

### Ablauf

**Gefecht**:
Ein vollständiges Duell zweier Fechter: Wer zuerst 5 Treffer hat, gewinnt; nach 3 Minuten gewinnt, wer vorne liegt.
_Vermeiden_: Match, Kampf, Runde
_Englisch_: bout

**Verlängerung**:
Eine zusätzliche Minute bei Gleichstand nach Ablauf der Zeit, in der der nächste Treffer das Gefecht entscheidet.
_Vermeiden_: Overtime, Sudden Death
_Englisch_: overtime

**Vorteil**:
Der vor der Verlängerung ausgeloste Anspruch eines Fechters, das Gefecht zu gewinnen, falls in der Verlängerung kein Treffer fällt.
_Vermeiden_: Priorität, Vorrecht (das ist eine Florett-/Säbelregel)
_Englisch_: priority

**Startlinie**:
Die Markierung, an der jeder Fechter vor Beginn und nach jedem Treffer steht.
_Vermeiden_: Spawn, Startpunkt
_Englisch_: en-garde line

**Kommando**:
Die Ansage „En garde – Prêts? – Allez!“, mit der es nach dem Zurücksetzen auf die Startlinien weitergeht.
_Vermeiden_: Countdown
_Englisch_: command

### Beteiligte und Ort

**Fechter**:
Eine Figur auf der Fechtbahn, die gesteuert wird – egal ob von einem Spieler oder vom Computer. Alle Fechter sind gleich stark und tragen Weiß; man unterscheidet sie nur an ihrer Farbe, die an Schuhen, Handschuh, Trefferanzeige und Punktestand gleich ist. Rot steht links, Grün rechts.
_Vermeiden_: Spieler (für die Figur), Kämpfer, Charakter
_Englisch_: fencer

**Spieler**:
Ein Mensch, der einen Fechter steuert.
_Vermeiden_: User, Nutzer
_Englisch_: player

**Computergegner**:
Ein Fechter, der nicht von einem Spieler, sondern vom Spiel gesteuert wird, in einer von drei Schwierigkeitsstufen (leicht, mittel, schwer).
_Vermeiden_: KI, Bot, CPU
_Englisch_: computer opponent

**Revanche**:
Ein neues Gefecht derselben Fechter direkt nach dem Ende des vorherigen.
_Vermeiden_: Rematch, Neustart
_Englisch_: rematch

**Training**:
Eine Folge von Lektionen, in denen ein Spieler die Aktionen einzeln gegen den Trainer übt – ohne Punkte und ohne Uhr.
_Vermeiden_: Tutorial, Übungsmodus
_Englisch_: training

**Lektion**:
Ein Abschnitt des Trainings, der als geschafft gilt, sobald der Spieler eine bestimmte Aktion erfolgreich ausführt.
_Vermeiden_: Level, Aufgabe, Mission
_Englisch_: lesson

**Trainer**:
Der Fechter, gegen den im Training geübt wird; er steht still oder greift in ruhigem Rhythmus an.
_Vermeiden_: Dummy, Puppe, Computergegner (das ist der Gegner im Gefecht)
_Englisch_: coach

**Fechtbahn**:
Die lange, schmale Metallbahn, auf der gefochten wird. Die Fechter stehen mittig auf ihr und bewegen sich nur vor und zurück; an den Endlinien geht es nicht weiter.
_Vermeiden_: Arena, Level, Bühne, Piste
_Englisch_: piste

**Mittellinie**:
Die Markierung quer über die Mitte der Fechtbahn.
_Vermeiden_: Mittelstrich
_Englisch_: centre line

**Endlinie**:
Die Markierung an jedem Ende der Fechtbahn, über die kein Fechter hinauskommt. Wer sie erreicht, bekommt keinen Treffer gegen sich.
_Vermeiden_: Wand, Bande, Grenze
_Englisch_: rear limit line

**Warnzone**:
Der farbig markierte Abschnitt vor jeder Endlinie, der anzeigt, dass das Ende der Fechtbahn nah ist. Er hat keine Regelwirkung.
_Vermeiden_: Gefahrenzone
_Englisch_: warning zone

**Meldegerät**:
Der Kasten neben der Fechtbahn, der Trefferanzeige, Punktestand und Uhr enthält.
_Vermeiden_: Scoreboard, Anzeigetafel, HUD
_Englisch_: scoring box
