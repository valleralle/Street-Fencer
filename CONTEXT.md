# game_pilot

Ein 2D-Fechtspiel für den Browser nach den Regeln des Degenfechtens: zwei Fechter stehen sich auf einer Fechtbahn gegenüber, und jeder gültige Treffer bringt einen Punkt.

## Sprache

### Kampf

**Degen**:
Die einzige Waffe im Spiel – eine Stoßwaffe, mit der nur mit der Spitze getroffen wird.
_Vermeiden_: Schwert, Klinge (als Waffenname), Florett, Säbel

**Treffer**:
Ein gültiger Stoß mit der Degenspitze auf den Gegner; er bringt dem Stoßenden einen Punkt.
_Vermeiden_: Schaden, Hit, Schlag

**Trefffläche**:
Der Bereich des Gegners, auf dem ein Treffer zählt – beim Degen der ganze Körper vom Kopf bis zum Fuß, beim Ausfall also auch der weit vorgestellte vordere Fuß.
_Vermeiden_: Hitbox (als Fachbegriff im Spiel)

**Doppeltreffer**:
Zwei Treffer, die so kurz nacheinander landen, dass sie als gleichzeitig gelten; beide Fechter bekommen einen Punkt. Beim entscheidenden Treffer wird ein Doppeltreffer gestrichen.
_Vermeiden_: Unentschieden, Gleichzeitiger Treffer

**Entscheidender Treffer**:
Ein Treffer, mit dem das Gefecht entschieden wäre – beim Stand von 4:4 oder in der Verlängerung.
_Vermeiden_: Matchball, Siegtreffer

**Trefferanzeige**:
Die zwei Lampen im Meldegerät in den Farben der Fechter, von denen jede mit einem Signalton den Treffer eines Fechters meldet; bei einem Doppeltreffer leuchten beide.
_Vermeiden_: Anzeige, Lampe (allein), Scoreboard

### Aktionen

**Grundstellung**:
Die Fechtstellung, in der ein Fechter steht, wenn er gerade keine Aktion ausführt – leicht in den Knien, Degen nach vorn.
_Vermeiden_: Idle, Ruhestellung, En garde (das ist das Kommando)

**Offen**:
Der kurze Zustand nach einer gegnerischen Parade, in dem ein Fechter keine Aktion beginnen kann und für eine Riposte ungeschützt ist.
_Vermeiden_: Betäubt, Stun

**Stoß**:
Ein schneller Angriff mit der Degenspitze aus dem Stand, mit kurzer Reichweite.
_Vermeiden_: Angriff (zu allgemein), Hieb, Schlag

**Ausfall**:
Ein großer Schritt nach vorn mit Stoß – weite Reichweite, danach ist der Fechter kurz verwundbar.
_Vermeiden_: Sprungangriff, Lunge

**Parade**:
Das Wegschlagen der gegnerischen Klinge; gelingt sie, ist der Gegner kurz offen.
_Vermeiden_: Block, Abwehr

**Riposte**:
Ein Gegenstoß direkt nach einer gelungenen Parade, schneller als ein normaler Stoß.
_Vermeiden_: Konter

**Tiefstoß**:
Der Fechter duckt sich unter einem hohen Stoß weg und stößt dabei zum Fuß des Gegners. Riskant, aber auch als Antwort auf eine Flèche gedacht.
_Vermeiden_: Ducken (allein), Fußstoß

**Flèche**:
Ein Sturmangriff im Laufen mit gestreckter Klinge, der aus mittlerer Distanz trifft; wer ihn verfehlt, ist lange verwundbar.
_Vermeiden_: Sturm, Dash

### Ablauf

**Gefecht**:
Ein vollständiges Duell zweier Fechter: Wer zuerst 5 Treffer hat, gewinnt; nach 3 Minuten gewinnt, wer vorne liegt.
_Vermeiden_: Match, Kampf, Runde

**Verlängerung**:
Eine zusätzliche Minute bei Gleichstand nach Ablauf der Zeit, in der der nächste Treffer das Gefecht entscheidet.
_Vermeiden_: Overtime, Sudden Death

**Vorteil**:
Der vor der Verlängerung ausgeloste Anspruch eines Fechters, das Gefecht zu gewinnen, falls in der Verlängerung kein Treffer fällt.
_Vermeiden_: Priorität, Vorrecht (das ist eine Florett-/Säbelregel)

**Startlinie**:
Die Markierung, an der jeder Fechter vor Beginn und nach jedem Treffer steht.
_Vermeiden_: Spawn, Startpunkt

**Kommando**:
Die Ansage „En garde – Prêts? – Allez!“, mit der es nach dem Zurücksetzen auf die Startlinien weitergeht.
_Vermeiden_: Countdown

### Beteiligte und Ort

**Fechter**:
Eine Figur auf der Fechtbahn, die gesteuert wird – egal ob von einem Spieler oder vom Computer. Alle Fechter sind gleich stark und tragen Weiß; man unterscheidet sie nur an ihrer Farbe, die an Schuhen, Handschuh, Trefferanzeige und Punktestand gleich ist. Rot steht links, Grün rechts.
_Vermeiden_: Spieler (für die Figur), Kämpfer, Charakter

**Spieler**:
Ein Mensch, der einen Fechter steuert.
_Vermeiden_: User, Nutzer

**Computergegner**:
Ein Fechter, der nicht von einem Spieler, sondern vom Spiel gesteuert wird, in einer von drei Schwierigkeitsstufen (leicht, mittel, schwer).
_Vermeiden_: KI, Bot, CPU

**Revanche**:
Ein neues Gefecht derselben Fechter direkt nach dem Ende des vorherigen.
_Vermeiden_: Rematch, Neustart

**Fechtbahn**:
Die lange, schmale Metallbahn, auf der gefochten wird. Die Fechter stehen mittig auf ihr und bewegen sich nur vor und zurück; an den Endlinien geht es nicht weiter.
_Vermeiden_: Arena, Level, Bühne, Piste

**Mittellinie**:
Die Markierung quer über die Mitte der Fechtbahn.
_Vermeiden_: Mittelstrich

**Endlinie**:
Die Markierung an jedem Ende der Fechtbahn, über die kein Fechter hinauskommt. Wer sie erreicht, bekommt keinen Treffer gegen sich.
_Vermeiden_: Wand, Bande, Grenze

**Warnzone**:
Der farbig markierte Abschnitt vor jeder Endlinie, der anzeigt, dass das Ende der Fechtbahn nah ist. Er hat keine Regelwirkung.
_Vermeiden_: Gefahrenzone

**Meldegerät**:
Der Kasten neben der Fechtbahn, der Trefferanzeige, Punktestand und Uhr enthält.
_Vermeiden_: Scoreboard, Anzeigetafel, HUD
