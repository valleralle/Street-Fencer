// Alle sichtbaren Texte des Spiels auf Deutsch und Englisch (Issue #12). Die Bildschirme holen ihre
// Texte nur über text('schluessel', { platzhalter }). Platzhalter stehen in geschweiften Klammern.
// Das Kommando „En garde – Prêts ? – Allez !“ bleibt in beiden Sprachen französisch (wie im Fechten).
// Achtung Kreis: einstellungen.js braucht text() für Tastennamen und dieses Modul die eingestellte
// Sprache. Beides wird erst beim Aufruf gebraucht, nicht beim Laden – so ist die Ladereihenfolge egal.
import { einstellungen } from './einstellungen.js';

const DE = {
  zurueck: 'Zurück',
  zurueckZumTitel: 'Zurück zum Titel',
  'farbe.rot': 'Rot',
  'farbe.gruen': 'Grün',
  zitat: '„{text}“',
  drehen: 'Bitte das Handy quer halten',
  'sprache.de': 'Deutsch',
  'sprache.en': 'English',

  'titel.untertitel': 'Degenfechten',
  'titel.training': 'Training',
  'titel.zweiSpieler': '2 Spieler',
  'titel.computer': 'Gegen Computer',
  'titel.steuerung': 'Steuerung',
  'titel.einstellungen': 'Einstellungen',
  'titel.fortschritt': 'Fortschritt',
  'titel.hinweisTouch': 'Antippen zum Auswählen',
  'titel.hinweisTasten': '↑ / ↓ wählen · Enter bestätigen',

  'stufen.untertitel': 'Du spielst Rot (links)',
  'stufe.leicht': 'Leicht',
  'stufe.mittel': 'Mittel',
  'stufe.schwer': 'Schwer',

  'einstellungen.musik': 'Musik: {wert}',
  'einstellungen.effekte': 'Effekte: {wert}',
  'einstellungen.sprache': 'Sprache: {wert}',
  'einstellungen.tasten': 'Tasten {farbe}',
  'einstellungen.standard': 'Standard wiederherstellen',
  'einstellungen.hinweisTouch': 'Antippen: Lautstärke links leiser, rechts lauter · Sprache wechseln',
  'einstellungen.hinweisTasten': '↑ / ↓ wählen · Lautstärke und Sprache mit A / D bzw. den Pfeiltasten · Esc zurück',

  'tasten.hinweis': 'Enter: neue Taste festlegen · Esc zurück · Esc, P, Enter und Leertaste sind reserviert',
  'tasten.warte': 'Drücke die neue Taste für {aktion} …',
  'tasten.abgebrochen': 'Abgebrochen',
  'tasten.ungueltig': 'Diese Taste geht nicht – bitte eine andere',

  'aktion.links': 'Links',
  'aktion.rechts': 'Rechts',
  'aktion.stoss': 'Stoß',
  'aktion.parade': 'Parade',
  'aktion.tiefstoss': 'Tiefstoß',
  'aktion.fleche': 'Flèche',
  'aktion.ausfall': 'Ausfall',
  'aktion.riposte': 'Riposte',
  'aktion.finte': 'Finte',

  'taste.LEFT': 'Pfeil links',
  'taste.RIGHT': 'Pfeil rechts',
  'taste.SHIFT': 'Umschalt',
  'taste.CTRL': 'Strg',
  'taste.BACKSPACE': 'Rücktaste',
  'taste.num': 'Num {taste}',
  'taste.pfeileLinksRechts': 'Pfeil links / rechts',

  'knopf.stoss': 'Stoß',
  'knopf.parade': 'Parade',
  'knopf.tiefstoss': 'Tief',
  'knopf.fleche': 'Flèche',

  'steuerung.kopfRot': 'Rot (links)',
  'steuerung.kopfGruen': 'Grün (rechts)',
  'steuerung.bewegen': 'Bewegen',
  'steuerung.regeln':
    'Ausfall = vorwärts + Stoß · Finte = beim Ausholen noch einmal Stoß\n' +
    'Riposte = Stoß direkt nach einer gelungenen Parade\n' +
    'Wer zuerst 5 Treffer hat, gewinnt · Esc oder P = Pause · Tasten ändern unter Einstellungen',
  'steuerung.losTasten': 'Enter: Los geht’s!',
  'steuerung.zurueckTasten': 'Enter: zurück',
  'steuerung.touchGehenKnopf': '{links} {rechts} (links unten)',
  'steuerung.touchGehen': 'gehen',
  'steuerung.touchStoss': 'zustechen',
  'steuerung.touchAusfallKnopf': '{rechts} halten + {stoss}',
  'steuerung.touchAusfall': 'Ausfall',
  'steuerung.touchParade': 'Stoß abwehren',
  'steuerung.touchTief': 'Tiefstoß – unter der Parade durch',
  'steuerung.touchFleche': 'Sturmangriff aus der Distanz',
  'steuerung.touchRegeln':
    'Finte = während des Ausholens noch einmal Stoß\n' +
    'Riposte = Stoß direkt nach einer gelungenen Parade\n' +
    'Du bist Rot (links) · wer zuerst 5 Treffer hat, gewinnt · ❚❚ oben rechts = Pause',
  'steuerung.losTouch': 'Antippen: Los geht’s!',
  'steuerung.zurueckTouch': 'Antippen: zurück',

  'kampf.pause': 'Esc / P: Pause',
  'kampf.charakter': '{farbe}: {charakter}',
  'kampf.zeit': 'Zeit !',
  'kampf.doppeltrefferGestrichen': 'Doppeltreffer – gestrichen',
  'kampf.doppeltreffer': 'Doppeltreffer!',
  'kampf.treffer': 'Treffer {farbe}!',
  'kampf.verlaengerung': 'Verlängerung · Vorteil {farbe}',
  'wiederholung.titel': 'Wiederholung',
  'wiederholung.folge': '{farbe}: {folge}',
  'wiederholung.nichts': 'keine Aktion',
  'wiederholung.ueberspringen': 'Enter / Esc: überspringen',
  'wiederholung.ueberspringenTouch': 'Antippen: überspringen',
  'charakter.angreifer': 'Angreifer',
  'charakter.konterfechter': 'Konterfechter',
  'charakter.taktiker': 'Taktiker',

  'pause.titel': 'Pause',
  'pause.weiter': 'Weiter',

  'sieger.gewinnt': '{farbe} gewinnt!',
  'sieger.revanche': 'Revanche',
  'sieger.wertung': 'Wertung {aenderung} → {wertung}',
  'sieger.aufstieg': 'Aufstieg: {rang}',
  'rang.anfaenger': 'Anfänger',
  'rang.vereinsfechter': 'Vereinsfechter',
  'rang.landesklasse': 'Landesklasse',
  'rang.bundesklasse': 'Bundesklasse',
  'rang.meister': 'Meister',
  'fortschritt.wertung': 'Wertung {wertung} · {rang}',
  'fortschritt.naechsterRang': 'Nächster Rang: {rang} ab {ab}',
  'fortschritt.quoten': 'Letzte {gefechte} Gefechte: {siegquote} % gewonnen · {trefferquote} % der Treffer',
  'fortschritt.leer': 'Noch keine Gefechte gegen den Computer.\nJedes Gefecht gegen den Computer zählt für die Wertung.',
  'statistik.angriffe': 'Angriffe',
  'statistik.finten': 'Finten',
  'statistik.treffer': 'Treffer',
  'statistik.riposten': 'davon Riposten',
  'statistik.paraden': 'Paraden',
  'statistik.doppeltreffer': 'Doppeltreffer',
  'statistik.trefferquote': 'Trefferquote',

  'training.zurueckTasten': 'Esc: zurück zum Titel',
  'training.nummer': 'Training · Lektion {nummer} von {gesamt}',
  'training.gut': 'Gut gemacht!',
  'training.pariert': 'Pariert! {tipp}',
  'training.getroffen': 'Getroffen – noch einmal!',
  'training.nochmal': 'Noch einmal!',
  'training.fertig': 'Training abgeschlossen!',
  'training.bereit': 'Jetzt bist du bereit für ein Gefecht.\n{weiter}',
  'training.weiterTouch': 'Antippen: zurück zum Titel',
  'training.weiterTasten': 'Enter oder Esc: zurück zum Titel',
  'bedienung.druecke': 'drücke',
  'bedienung.Druecke': 'Drücke',
  'bedienung.druecken': 'drücken',
  'bedienung.tippe': 'tippe',
  'bedienung.Tippe': 'Tippe',
  'bedienung.tippen': 'tippen',

  'lektion.bewegen.titel': 'Bewegen',
  'lektion.bewegen.text': 'Gehe mit {rechts} vor und mit {links} zurück.',
  'lektion.stoss.titel': 'Stoß',
  'lektion.stoss.text': 'Gehe nah heran und stoße mit {stoss}.',
  'lektion.stoss.tipp': 'Diesmal nur ein einfacher Stoß – ohne vorwärts zu drücken.',
  'lektion.ausfall.titel': 'Ausfall',
  'lektion.ausfall.text': 'Aus größerer Entfernung: {rechts} halten und dabei {stoss} {druecken}.',
  'lektion.ausfall.tipp': 'Halte beim Stoß gleichzeitig vorwärts gedrückt.',
  'lektion.parade.titel': 'Parade',
  'lektion.parade.text': 'Der Trainer greift an. {Druecke} {parade}, sobald er ausholt.',
  'lektion.riposte.titel': 'Riposte',
  'lektion.riposte.text': 'Pariere mit {parade} und stoße direkt danach mit {stoss} zurück.',
  'lektion.riposte.tipp': 'Stoße gleich nach der gelungenen Parade.',
  'lektion.finte.titel': 'Finte',
  'lektion.finte.text':
    'Der Trainer pariert jeden Angriff. Täusche ihn: {druecke} {stoss} dreimal im Rhythmus – ausholen, abbrechen, zustoßen.',
  'lektion.finte.tipp': 'Nicht zu schnell: der echte Stoß muss nach seiner Parade kommen.',
  'lektion.tiefstoss.titel': 'Tiefstoß',
  'lektion.tiefstoss.text': 'Tauche mit {tiefstoss} unter dem Stoß des Trainers weg.',
  'lektion.tiefstoss.tipp': 'Warte, bis er ausholt, und tauche dann ab.',
  'lektion.fleche.titel': 'Flèche',
  'lektion.fleche.text': 'Sturmangriff aus der Distanz: {druecke} {fleche}.',
  'lektion.fleche.tipp': 'Für die Flèche brauchst du Anlauf – geh erst etwas zurück.',
};

// Fechtbegriffe wie im englischsprachigen Fechten (siehe CONTEXT.md)
const EN = {
  zurueck: 'Back',
  zurueckZumTitel: 'Back to title',
  'farbe.rot': 'Red',
  'farbe.gruen': 'Green',
  zitat: '“{text}”',
  drehen: 'Please turn your phone sideways',
  'sprache.de': 'Deutsch',
  'sprache.en': 'English',

  'titel.untertitel': 'Épée fencing',
  'titel.training': 'Training',
  'titel.zweiSpieler': '2 players',
  'titel.computer': 'Versus computer',
  'titel.steuerung': 'Controls',
  'titel.einstellungen': 'Settings',
  'titel.fortschritt': 'Progress',
  'titel.hinweisTouch': 'Tap to select',
  'titel.hinweisTasten': '↑ / ↓ choose · Enter confirm',

  'stufen.untertitel': 'You play Red (left)',
  'stufe.leicht': 'Easy',
  'stufe.mittel': 'Medium',
  'stufe.schwer': 'Hard',

  'einstellungen.musik': 'Music: {wert}',
  'einstellungen.effekte': 'Effects: {wert}',
  'einstellungen.sprache': 'Language: {wert}',
  'einstellungen.tasten': 'Keys {farbe}',
  'einstellungen.standard': 'Restore defaults',
  'einstellungen.hinweisTouch': 'Tap: volume left quieter, right louder · switch language',
  'einstellungen.hinweisTasten': '↑ / ↓ choose · volume and language with A / D or the arrow keys · Esc back',

  'tasten.hinweis': 'Enter: set a new key · Esc back · Esc, P, Enter and Space are reserved',
  'tasten.warte': 'Press the new key for {aktion} …',
  'tasten.abgebrochen': 'Cancelled',
  'tasten.ungueltig': 'This key doesn’t work – please choose another',

  'aktion.links': 'Left',
  'aktion.rechts': 'Right',
  'aktion.stoss': 'Thrust',
  'aktion.parade': 'Parry',
  'aktion.tiefstoss': 'Low thrust',
  'aktion.fleche': 'Flèche',
  'aktion.ausfall': 'Lunge',
  'aktion.riposte': 'Riposte',
  'aktion.finte': 'Feint',

  'taste.LEFT': 'Left arrow',
  'taste.RIGHT': 'Right arrow',
  'taste.SHIFT': 'Shift',
  'taste.CTRL': 'Ctrl',
  'taste.BACKSPACE': 'Backspace',
  'taste.num': 'Num {taste}',
  'taste.pfeileLinksRechts': 'Left / right arrow',

  'knopf.stoss': 'Thrust',
  'knopf.parade': 'Parry',
  'knopf.tiefstoss': 'Low',
  'knopf.fleche': 'Flèche',

  'steuerung.kopfRot': 'Red (left)',
  'steuerung.kopfGruen': 'Green (right)',
  'steuerung.bewegen': 'Move',
  'steuerung.regeln':
    'Lunge = forward + thrust · Feint = thrust again while drawing back\n' +
    'Riposte = thrust right after a successful parry\n' +
    'First to 5 touches wins · Esc or P = pause · change keys in Settings',
  'steuerung.losTasten': 'Enter: let’s go!',
  'steuerung.zurueckTasten': 'Enter: back',
  'steuerung.touchGehenKnopf': '{links} {rechts} (bottom left)',
  'steuerung.touchGehen': 'walk',
  'steuerung.touchStoss': 'thrust',
  'steuerung.touchAusfallKnopf': 'hold {rechts} + {stoss}',
  'steuerung.touchAusfall': 'lunge',
  'steuerung.touchParade': 'block a thrust',
  'steuerung.touchTief': 'low thrust – under the parry',
  'steuerung.touchFleche': 'running attack from a distance',
  'steuerung.touchRegeln':
    'Feint = thrust again while drawing back\n' +
    'Riposte = thrust right after a successful parry\n' +
    'You are Red (left) · first to 5 touches wins · ❚❚ top right = pause',
  'steuerung.losTouch': 'Tap: let’s go!',
  'steuerung.zurueckTouch': 'Tap: back',

  'kampf.pause': 'Esc / P: pause',
  'kampf.charakter': '{farbe}: {charakter}',
  'kampf.zeit': 'Time!',
  'kampf.doppeltrefferGestrichen': 'Double touch – annulled',
  'kampf.doppeltreffer': 'Double touch!',
  'kampf.treffer': 'Touch {farbe}!',
  'kampf.verlaengerung': 'Overtime · priority {farbe}',
  'wiederholung.titel': 'Replay',
  'wiederholung.folge': '{farbe}: {folge}',
  'wiederholung.nichts': 'no action',
  'wiederholung.ueberspringen': 'Enter / Esc: skip',
  'wiederholung.ueberspringenTouch': 'Tap: skip',
  'charakter.angreifer': 'Attacker',
  'charakter.konterfechter': 'Counter-fencer',
  'charakter.taktiker': 'Tactician',

  'pause.titel': 'Pause',
  'pause.weiter': 'Resume',

  'sieger.gewinnt': '{farbe} wins!',
  'sieger.revanche': 'Rematch',
  'sieger.wertung': 'Rating {aenderung} → {wertung}',
  'sieger.aufstieg': 'Promoted: {rang}',
  'rang.anfaenger': 'Beginner',
  'rang.vereinsfechter': 'Club fencer',
  'rang.landesklasse': 'Regional class',
  'rang.bundesklasse': 'National class',
  'rang.meister': 'Master',
  'fortschritt.wertung': 'Rating {wertung} · {rang}',
  'fortschritt.naechsterRang': 'Next rank: {rang} at {ab}',
  'fortschritt.quoten': 'Last {gefechte} bouts: {siegquote} % won · {trefferquote} % of touches',
  'fortschritt.leer': 'No bouts against the computer yet.\nEvery bout against the computer counts for the rating.',
  'statistik.angriffe': 'Attacks',
  'statistik.finten': 'Feints',
  'statistik.treffer': 'Touches',
  'statistik.riposten': 'of which ripostes',
  'statistik.paraden': 'Parries',
  'statistik.doppeltreffer': 'Double touches',
  'statistik.trefferquote': 'Hit rate',

  'training.zurueckTasten': 'Esc: back to title',
  'training.nummer': 'Training · lesson {nummer} of {gesamt}',
  'training.gut': 'Well done!',
  'training.pariert': 'Parried! {tipp}',
  'training.getroffen': 'You were hit – try again!',
  'training.nochmal': 'Try again!',
  'training.fertig': 'Training complete!',
  'training.bereit': 'Now you are ready for a bout.\n{weiter}',
  'training.weiterTouch': 'Tap: back to title',
  'training.weiterTasten': 'Enter or Esc: back to title',
  'bedienung.druecke': 'press',
  'bedienung.Druecke': 'Press',
  'bedienung.druecken': 'press',
  'bedienung.tippe': 'tap',
  'bedienung.Tippe': 'Tap',
  'bedienung.tippen': 'tap',

  'lektion.bewegen.titel': 'Moving',
  'lektion.bewegen.text': 'Move forward with {rechts} and back with {links}.',
  'lektion.stoss.titel': 'Thrust',
  'lektion.stoss.text': 'Get close and thrust with {stoss}.',
  'lektion.stoss.tipp': 'Just a simple thrust this time – without pressing forward.',
  'lektion.ausfall.titel': 'Lunge',
  'lektion.ausfall.text': 'From further away: hold {rechts} and {druecken} {stoss} at the same time.',
  'lektion.ausfall.tipp': 'Keep holding forward while you thrust.',
  'lektion.parade.titel': 'Parry',
  'lektion.parade.text': 'The coach attacks. {Druecke} {parade} the moment the coach draws back.',
  'lektion.riposte.titel': 'Riposte',
  'lektion.riposte.text': 'Parry with {parade}, then thrust back right away with {stoss}.',
  'lektion.riposte.tipp': 'Thrust right after the successful parry.',
  'lektion.finte.titel': 'Feint',
  'lektion.finte.text':
    'The coach parries every attack. Fool the coach: {druecke} {stoss} three times in rhythm – draw back, break off, thrust.',
  'lektion.finte.tipp': 'Not too fast: the real thrust must come after the coach’s parry.',
  'lektion.tiefstoss.titel': 'Low thrust',
  'lektion.tiefstoss.text': 'Duck under the coach’s thrust with {tiefstoss}.',
  'lektion.tiefstoss.tipp': 'Wait for the coach to draw back, then duck.',
  'lektion.fleche.titel': 'Flèche',
  'lektion.fleche.text': 'Running attack from a distance: {druecke} {fleche}.',
  'lektion.fleche.tipp': 'The flèche needs a run-up – step back a little first.',
};

export const WOERTERBUECHER = { de: DE, en: EN };

// Pixelify Sans macht aus „fi“ ein Zeichen, das wie „A“ aussieht (Ligatur). Ein unsichtbares
// Trennzeichen (Zero Width Non-Joiner) zwischen f und i verhindert das.
export const ohneFi = (t) => t.replace(/f(?=i)/g, 'f‌');

// Text in der eingestellten Sprache; Platzhalter {name} werden aus werte gefüllt
export function text(schluessel, werte = {}, sprache = einstellungen.sprache) {
  const roh = WOERTERBUECHER[sprache]?.[schluessel] ?? DE[schluessel] ?? schluessel;
  return ohneFi(roh.replace(/\{(\w+)\}/g, (_, name) => String(werte[name] ?? `{${name}}`)));
}

// Name einer Farbe in der eingestellten Sprache (rot → „Rot“ / „Red“)
export const farbname = (farbe) => text(`farbe.${farbe}`);

// Sprache der Seite (für Vorlesehilfen) und der Hinweis „Handy quer halten“ aus index.html
export function wendeSpracheAufSeiteAn(dokument = globalThis.document) {
  if (!dokument) return;
  dokument.documentElement.lang = einstellungen.sprache;
  const hinweis = dokument.querySelector('#drehen .text');
  if (hinweis) hinweis.textContent = text('drehen');
}
