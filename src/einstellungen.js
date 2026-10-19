// Einstellungen des Spiels: Lautstärken, Tastenbelegung und Sprache. Sie werden im Browser gespeichert
// (localStorage) und gelten für alle Bildschirme über das gemeinsame Objekt `einstellungen`.
import { text } from './texte.js';

export const SPRACHEN = ['de', 'en'];

export const STANDARD = {
  musik: 0.5, // 0 bis 1
  effekte: 0.8, // 0 bis 1
  sprache: 'de', // 'de' oder 'en'; beim ersten Start wie im Browser (siehe ladeEinstellungen)
  tasten: {
    rot: { links: 'A', rechts: 'D', stoss: 'F', parade: 'G', tiefstoss: 'S', fleche: 'R' },
    gruen: { links: 'LEFT', rechts: 'RIGHT', stoss: 'K', parade: 'L', tiefstoss: 'DOWN', fleche: 'J' },
  },
};

export const AKTIONEN = ['links', 'rechts', 'stoss', 'parade', 'tiefstoss', 'fleche'];
// Name einer Aktion in der eingestellten Sprache (z. B. „Stoß“ / „Thrust“)
export const aktionsName = (aktion) => text(`aktion.${aktion}`);

// Sprache beim ersten Start: Englisch, wenn der Browser Englisch spricht, sonst Deutsch
export const standardSprache = (browserSprache) => (/^en\b/i.test(browserSprache ?? '') ? 'en' : 'de');
// Nur im Browser zählt dessen Sprache – in den Tests (Node) gilt Deutsch
const BROWSER_SPRACHE = globalThis.document ? globalThis.navigator?.language : undefined;

// Diese Tasten bleiben für Pause und Menüs reserviert
export const RESERVIERT = ['ESC', 'P', 'ENTER', 'SPACE'];

const SCHLUESSEL = 'street-fencer.einstellungen';
// Unter diesem Schlüssel lagen die Einstellungen zur Zeit des Arbeitstitels „game_pilot“;
// sie werden beim ersten Laden übernommen (siehe ladeEinstellungen)
const ALTER_SCHLUESSEL = 'game_pilot.einstellungen';

const kopie = (e) => JSON.parse(JSON.stringify(e));

// Lädt die gespeicherten Einstellungen; fehlende oder kaputte Werte werden durch den Standard ersetzt
export function ladeEinstellungen(speicher = globalThis.localStorage, browserSprache = BROWSER_SPRACHE) {
  const e = kopie(STANDARD);
  e.sprache = standardSprache(browserSprache);
  try {
    const gespeichert = JSON.parse(speicher?.getItem(SCHLUESSEL) ?? uebernimmAlteEinstellungen(speicher) ?? 'null');
    if (!gespeichert) return e;
    for (const art of ['musik', 'effekte']) {
      if (typeof gespeichert[art] === 'number') e[art] = begrenze(gespeichert[art]);
    }
    if (SPRACHEN.includes(gespeichert.sprache)) e.sprache = gespeichert.sprache;
    for (const farbe of ['rot', 'gruen']) {
      for (const aktion of AKTIONEN) {
        const taste = gespeichert.tasten?.[farbe]?.[aktion];
        if (typeof taste === 'string' && !RESERVIERT.includes(taste)) e.tasten[farbe][aktion] = taste;
      }
    }
  } catch {
    // Kein Speicher (z. B. privates Fenster) oder kaputte Daten: Standard verwenden
  }
  return e;
}

// Einmalig: Einstellungen vom alten Schlüssel unter den neuen verschieben. Liefert die alten Daten (oder null).
function uebernimmAlteEinstellungen(speicher) {
  const alt = speicher?.getItem(ALTER_SCHLUESSEL);
  if (alt === null || alt === undefined) return null;
  speicher.setItem(SCHLUESSEL, alt);
  speicher.removeItem?.(ALTER_SCHLUESSEL);
  return alt;
}

export function speichereEinstellungen(e, speicher = globalThis.localStorage) {
  try {
    speicher?.setItem(SCHLUESSEL, JSON.stringify(e));
  } catch {
    // Speichern ist nicht möglich – die Einstellungen gelten dann nur bis zum Neuladen
  }
}

const begrenze = (wert) => Math.round(Math.min(1, Math.max(0, wert)) * 10) / 10;

// Ändert eine Lautstärke um schritte × 10 %
export function aendereLautstaerke(e, art, schritte) {
  e[art] = begrenze(e[art] + schritte / 10);
  return e;
}

// Legt eine Taste auf eine Aktion. Ist die Taste schon belegt (auch beim anderen Spieler),
// bekommt die andere Aktion die bisherige Taste – so liegen nie zwei Aktionen auf einer Taste.
// Liefert false, wenn die Taste reserviert ist.
export function belegeTaste(e, farbe, aktion, taste) {
  if (RESERVIERT.includes(taste)) return false;
  const alteTaste = e.tasten[farbe][aktion];
  for (const f of ['rot', 'gruen']) {
    for (const a of AKTIONEN) {
      if (e.tasten[f][a] === taste) e.tasten[f][a] = alteTaste;
    }
  }
  e.tasten[farbe][aktion] = taste;
  return true;
}

export function setzeZurueck(e) {
  // Die Sprache bleibt – „Standard“ meint Lautstärken und Tasten
  Object.assign(e, { ...kopie(STANDARD), sprache: e.sprache });
  return e;
}

// Wechselt zur nächsten Sprache (Deutsch ↔ Englisch)
export function wechsleSprache(e, schritte = 1) {
  const i = SPRACHEN.indexOf(e.sprache);
  e.sprache = SPRACHEN[(i + schritte + SPRACHEN.length) % SPRACHEN.length];
  return e;
}

// Lesbarer Name einer Taste; ← und → fehlen in der Pixelschrift, daher als Wort (in der eingestellten Sprache)
const TASTEN_ZEICHEN = { UP: '↑', DOWN: '↓', ALT: 'Alt', TAB: 'Tab' };
const TASTEN_WOERTER = ['LEFT', 'RIGHT', 'SHIFT', 'CTRL', 'BACKSPACE'];
export function tastenName(taste) {
  if (TASTEN_ZEICHEN[taste]) return TASTEN_ZEICHEN[taste];
  if (TASTEN_WOERTER.includes(taste)) return text(`taste.${taste}`);
  if (taste.startsWith('NUMPAD_')) return text('taste.num', { taste: taste.slice(7).toLowerCase() });
  return taste;
}

// Die Einstellungen dieses Spiels – alle Bildschirme lesen und ändern dieses eine Objekt
export const einstellungen = ladeEinstellungen();
