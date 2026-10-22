// Entscheidet nach einem Push auf main, ob ein Release fällig ist (siehe .github/workflows/android.yml):
// fällig, wenn es zur Version aus package.json noch keinen Tag gibt und docs/releases/v<Version>.md
// existiert. Dann legt der Workflow Tag und Release v<Version> selbst an und hängt die APK an –
// ein neues Release entsteht also durch einen PR, der die Version erhöht und die Notizen mitbringt.
//
// Aufruf im Workflow: node werkzeuge/android/release.mjs
// Schreibt RELEASE_TAG und NOTIZEN nach $GITHUB_ENV, wenn ein Release fällig ist.
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const notizenDatei = (tag) => `docs/releases/${tag}.md`;

// Liefert { tag } für ein fälliges Release, sonst { tag: null, grund }
export function faelligesRelease({ version, vorhandeneTags, notizenVorhanden }) {
  const tag = `v${version}`;
  if (vorhandeneTags.includes(tag)) return { tag: null, grund: `${tag} gibt es schon` };
  if (!notizenVorhanden) return { tag: null, grund: `${notizenDatei(tag)} fehlt – ohne Release-Notizen kein Release` };
  return { tag, grund: null };
}

// Tag-Namen aus der Ausgabe von git ls-remote --tags („<sha>\trefs/tags/v0.3.0“, auch „…^{}“)
export function tagsAus(lsRemote) {
  const tags = lsRemote.split('\n').map((zeile) => zeile.match(/refs\/tags\/(.+?)(\^\{\})?$/)?.[1]);
  return [...new Set(tags.filter(Boolean))];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const vorhandeneTags = tagsAus(execFileSync('git', ['ls-remote', '--tags', 'origin'], { encoding: 'utf8' }));
  const ergebnis = faelligesRelease({ version, vorhandeneTags, notizenVorhanden: existsSync(notizenDatei(`v${version}`)) });
  if (!ergebnis.tag) {
    console.log(`Kein Release: ${ergebnis.grund}`);
  } else {
    console.log(`::notice::Release ${ergebnis.tag} wird angelegt`);
    appendFileSync(process.env.GITHUB_ENV, `RELEASE_TAG=${ergebnis.tag}\nNOTIZEN=${notizenDatei(ergebnis.tag)}\n`);
  }
}
