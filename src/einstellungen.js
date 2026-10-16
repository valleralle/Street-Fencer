// Einstellungen des Spiels: Lautstärken und Tastenbelegung. Sie werden im Browser gespeichert
// (localStorage) und gelten für alle Bildschirme über das gemeinsame Objekt `einstellungen`.

export const STANDARD = {
  musik: 0.5, // 0 bis 1
  effekte: 0.8, // 0 bis 1
  tasten: {
    rot: { links: 'A', rechts: 'D', stoss: 'F', parade: 'G', tiefstoss: 'S', fleche: 'R' },
    gruen: { links: 'LEFT', rechts: 'RIGHT', stoss: 'K', parade: 'L', tiefstoss: 'DOWN', fleche: 'J' },
  },
};

export const AKTIONEN = ['links', 'rechts', 'stoss', 'parade', 'tiefstoss', 'fleche'];
export const AKTIONS_NAMEN = {
  links: 'Links',
  rechts: 'Rechts',
  stoss: 'Stoß',
  parade: 'Parade',
  tiefstoss: 'Tiefstoß',
  fleche: 'Flèche',
};

// Diese Tasten bleiben für Pause und Menüs reserviert
export const RESERVIERT = ['ESC', 'P', 'ENTER', 'SPACE'];

// Der Schlüssel stammt noch aus der Zeit des Arbeitstitels 

const kopie = (e) => JSON.parse(JSON.stringify(e));

// Lädt die gespeicherten Einstellungen; fehlende oder kaputte Werte werden durch den Standard ersetzt
export function ladeEinstellungen(speicher = globalThis.localStorage) {
  const e = kopie(STANDARD);
  try {
    const gespeichert = JSON.parse(speicher?.getItem(SCHLUESSEL) ?? 'null');
    if (!gespeichert) return e;
    for (const art of ['musik', 'effekte']) {
      if (typeof gespeichert[art] === 'number') e[art] = begrenze(gespeichert[art]);
    }
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
  Object.assign(e, kopie(STANDARD));
  return e;
}

// Lesbarer Name einer Taste; ← und → fehlen in der Pixelschrift, daher als Wort
const TASTEN_NAMEN = {
  LEFT: 'Pfeil links',
  RIGHT: 'Pfeil rechts',
  UP: '↑',
  DOWN: '↓',
  SHIFT: 'Umschalt',
  CTRL: 'Strg',
  ALT: 'Alt',
  BACKSPACE: 'Rücktaste',
  TAB: 'Tab',
};
export function tastenName(taste) {
  if (TASTEN_NAMEN[taste]) return TASTEN_NAMEN[taste];
  if (taste.startsWith('NUMPAD_')) return `Num ${taste.slice(7).toLowerCase()}`;
  return taste;
}

// Die Einstellungen dieses Spiels – alle Bildschirme lesen und ändern dieses eine Objekt
export const einstellungen = ladeEinstellungen();
