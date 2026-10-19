import { stil } from './schrift.js';
import { BREITE, HOEHE, rand } from './bildschirm.js';
import { text } from './texte.js';

// Touch-Steuerung fürs Handy: links zwei Knöpfe zum Gehen, rechts die Aktionen.
// Liefert dieselbe Schnittstelle wie tastaturSteuerung (gehalten / gedrueckt), Tastatur geht weiterhin.

// Läuft das Spiel auf einem Handy oder Tablet? (Laptops mit Touchscreen behalten die Tastatursteuerung)
export function istTouchGeraet(szene) {
  return szene.sys.game.device.input.touch && matchMedia('(pointer: coarse)').matches;
}

// Lage der Knöpfe im Spielbild (960 × 540): x, y, Radius; Beschriftung: zeichen oder Text in der eingestellten Sprache.
// Ist der Bildschirm breiter oder höher (siehe bildschirm.js), bleiben die Knöpfe an den Ecken unten:
// Gehen links unten, die Aktionen rechts unten.
const KNOEPFE = {
  links: { x: 85, y: 455, r: 60, zeichen: '◀' },
  rechts: { x: 225, y: 455, r: 60, zeichen: '▶' },
  stoss: { x: 868, y: 452, r: 62 },
  parade: { x: 735, y: 487, r: 46 },
  tiefstoss: { x: 618, y: 492, r: 42 },
  fleche: { x: 882, y: 318, r: 40 },
};
const AKTIONEN = ['stoss', 'parade', 'tiefstoss', 'fleche'];

// Beschriftung eines Knopfs, z. B. für Anleitungen im Training
export const knopfText = (name) => KNOEPFE[name].zeichen ?? text(`knopf.${name}`);
// Etwas großzügiger als der gezeichnete Kreis, damit Daumen auch knapp daneben treffen
const TOLERANZ = 1.2;

// Mitte eines Knopfs auf dem Bildschirm, bei einem Spielbild von breite × hoehe
export function knopfMitte(name, breite = BREITE, hoehe = HOEHE) {
  const k = KNOEPFE[name];
  const rechts = !['links', 'rechts'].includes(name);
  return { x: k.x + (rechts ? breite - BREITE : 0), y: k.y + hoehe - HOEHE };
}

// x, y: Lage auf dem Bildschirm (wie zeiger.x / zeiger.y)
export function knopfUnter(x, y, namen, breite = BREITE, hoehe = HOEHE) {
  return namen.find((name) => {
    const m = knopfMitte(name, breite, hoehe);
    return Math.hypot(x - m.x, y - m.y) <= KNOEPFE[name].r * TOLERANZ;
  });
}

// tastatur = eine Steuerung aus steuerung.js, die zusätzlich gilt
// Liefert { steuerung, objekte } – objekte gehören in die UI-Kamera (siehe Kamera.js)
export function touchSteuerung(szene, tastatur) {
  szene.input.addPointer(3); // bis zu vier Finger gleichzeitig
  const gedrueckt = new Set();
  const objekte = [];
  const kreise = {};
  const texte = {};
  const unter = (zeiger, namen) => knopfUnter(zeiger.x, zeiger.y, namen, szene.scale.width, szene.scale.height);

  for (const [name, k] of Object.entries(KNOEPFE)) {
    const kreis = szene.add.circle(k.x, k.y, k.r, 0xffffff, 0.12).setStrokeStyle(3, 0xffffff, 0.45);
    const beschriftung = knopfText(name);
    const groesse = beschriftung.length > 2 ? Math.round(k.r * 0.42) : Math.round(k.r * 0.7);
    const schild = szene.add.text(k.x, k.y, beschriftung, stil(groesse, '#ffffff')).setOrigin(0.5).setAlpha(0.8);
    kreise[name] = kreis;
    texte[name] = schild;
    objekte.push(kreis, schild);
  }

  // Die Knöpfe liegen in der UI-Kamera, die um den Rand verschoben ist (siehe Kamera.js)
  const platziere = () => {
    const r = rand(szene);
    for (const name of Object.keys(KNOEPFE)) {
      const m = knopfMitte(name, szene.scale.width, szene.scale.height);
      kreise[name].setPosition(m.x - r.x, m.y - r.y);
      texte[name].setPosition(m.x - r.x, m.y - r.y);
    }
  };
  platziere();
  szene.scale.on('resize', platziere);
  szene.events.once('shutdown', () => szene.scale.off('resize', platziere));

  // Ein neuer Finger auf einem Aktionsknopf zählt als Tastendruck
  const beiBeruehrung = (zeiger) => {
    const name = unter(zeiger, AKTIONEN);
    if (name) gedrueckt.add(name);
  };
  szene.input.on('pointerdown', beiBeruehrung);
  szene.events.once('shutdown', () => szene.input.off('pointerdown', beiBeruehrung));

  // Gehen: solange irgendein Finger auf dem Knopf liegt (auch wenn er dorthin gerutscht ist)
  const gehaltenTouch = (name) =>
    szene.input.manager.pointers.some((p) => p.isDown && unter(p, ['links', 'rechts']) === name);

  // Gedrückte Knöpfe kurz aufleuchten lassen
  szene.events.on('update', () => {
    for (const [name, kreis] of Object.entries(kreise)) {
      const an = AKTIONEN.includes(name)
        ? szene.input.manager.pointers.some((p) => p.isDown && unter(p, [name]))
        : gehaltenTouch(name);
      kreis.setFillStyle(0xffffff, an ? 0.35 : 0.12);
    }
  });

  const steuerung = {
    gehalten: (name) => tastatur.gehalten(name) || gehaltenTouch(name),
    gedrueckt: (name) => {
      const touch = gedrueckt.delete(name);
      // Tastatur immer abfragen, damit ihr Tastendruck verbraucht wird
      return tastatur.gedrueckt(name) || touch;
    },
  };
  return { steuerung, objekte };
}
