# Street Fencer

Degenfechten im Browser (Phaser + Vite). Fachbegriffe und ihre Bedeutung stehen in `CONTEXT.md` – im Code, in Texten und im Gespräch diese Begriffe verwenden. Entscheidungen stehen in `docs/adr/`, Annahmen aus selbstständiger Arbeit in `ANNAHMEN.md`.

## Sprache

Alles auf Deutsch: Gespräch, Bezeichner im Code, Kommentare, Doku, Commit-Nachrichten, Issues und Pull Requests.

## Änderungen nur per Pull Request

Jeder Push auf `main` veröffentlicht sofort die Browser-Version auf GitHub Pages (`.github/workflows/web.yml`), und mehrere Claude-Sitzungen arbeiten parallel am Repo. Deshalb gilt für jede Änderung, auch die kleinste:

1. `main` aktualisieren, dann einen eigenen Branch anlegen.
2. Committen erst, wenn `npm test` grün ist.
3. Branch pushen und einen Pull Request gegen `main` öffnen; gehört die Änderung zu einem Issue, steht im Text „Closes #N“.
4. Fertig ist die Aufgabe mit dem PR-Link an den Nutzer – der Nutzer merged selbst.

## Fallstricke

- `src/pixelart/fechterPosen.js` wird von `werkzeuge/pixelart-zeichnen.mjs` erzeugt: Posen im Zeichenskript ändern, dann `npm run pixelart:zeichnen`.
- Pixelify Sans macht aus „fi“ ein Zeichen, das wie „A“ aussieht: neue Texte im Spiel darauf prüfen.
- Ziffern kommen aus einer eigenen Schrift (`src/pixelart/ziffern.js` → `npm run ziffern` → `public/schrift/street-fencer-ziffern.ttf`), die in `index.html` für 0–9 und „:“ vor Pixelify Sans greift. Ziffern im Raster ändern, dann `npm run ziffern`.
- Unter Windows mit PowerShell: Typografische Anführungszeichen („ “) beenden doppelt gequotete Strings – für Texte mit „…“ einfach gequotete Here-Strings (`@'…'@`) oder das Edit-Werkzeug verwenden.

## Agent skills

### Issue tracker

Tickets liegen als GitHub Issues in valleralle/Street-Fencer. See `docs/agents/issue-tracker.md`.

### Triage labels

Standard-Labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` plus `bug` / `enhancement`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` und `docs/adr/` im Wurzelverzeichnis. See `docs/agents/domain.md`.
