# Street Fencer

2D-Fechtspiel (Degen) mit Phaser und Vite – eine Codebasis für Browser, Android-App (Capacitor) und Windows-.exe. Überblick in `README.md`, Begriffe in `CONTEXT.md`, Entscheidungen in `docs/adr/`, Annahmen in `ANNAHMEN.md`.

- Code, Kommentare, Commits, Tickets und Doku sind auf **Deutsch**.
- Tests: `npm test` (Node-Testrunner, ohne Browser). Build: `npm run build`.
- Änderungen als PR nach `main`; jeder PR baut Web-Version und Android-APK.

## Agent skills

### Issue tracker

Tickets liegen als GitHub Issues in valleralle/Street-Fencer. See `docs/agents/issue-tracker.md`.

### Triage labels

Standard-Labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` plus `bug` / `enhancement`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` und `docs/adr/` im Wurzelverzeichnis. See `docs/agents/domain.md`.
