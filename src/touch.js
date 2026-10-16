import { stil } from './schrift.js';

// Touch-Steuerung fürs Handy: links zwei Knöpfe zum Gehen, rechts die Aktionen.
// Liefert dieselbe Schnittstelle wie tastaturSteuerung (gehalten / gedrueckt), Tastatur geht weiterhin.

// Läuft das Spiel auf einem Handy oder Tablet? (Laptops mit Touchscreen behalten die Tastatursteuerung)
export function istTouchGeraet(szene) {
  return szene.sys.game.device.input.touch && matchMedia('(pointer: coarse)').matches;
}

// Lage der Knöpfe im Spielbild (960 × 540): x, y, Radius, Beschriftung
const KNOEPFE = {
  links: { x: 85, y: 455, r: 60, text: '◀' },
  rechts: { x: 225, y: 455, r: 60, text: '▶' },
  stoss: { x: 868, y: 452, r: 62, text: 'Stoß' },
  parade: { x: 735, y: 487, r: 46, text: 'Parade' },
  tiefstoss: { x: 765, y: 370, r: 42, text: 'Tief' },
  fleche: { x: 882, y: 318, r: 40, text: 'Flèche' },
};
const AKTIONEN = ['stoss', 'parade', 'tiefstoss', 'fleche'];
// Etwas großzügiger als der gezeichnete Kreis, damit Daumen auch knapp daneben treffen
const TOLERANZ = 1.2;

export function knopfUnter(x, y, namen) {
  return namen.find((name) => {
    const k = KNOEPFE[name];
    return Math.hypot(x - k.x, y - k.y) <= k.r * TOLERANZ;
  });
}

// tastatur = eine Steuerung aus steuerung.js, die zusätzlich gilt
// Liefert { steuerung, objekte } – objekte gehören in die UI-Kamera (siehe Kamera.js)
export function touchSteuerung(szene, tastatur) {
  szene.input.addPointer(3); // bis zu vier Finger gleichzeitig
  const gedrueckt = new Set();
  const objekte = [];
  const kreise = {};

  for (const [name, k] of Object.entries(KNOEPFE)) {
    const kreis = szene.add.circle(k.x, k.y, k.r, 0xffffff, 0.12).setStrokeStyle(3, 0xffffff, 0.45);
    const groesse = k.text.length > 2 ? Math.round(k.r * 0.42) : Math.round(k.r * 0.7);
    const text = szene.add.text(k.x, k.y, k.text, stil(groesse, '#ffffff')).setOrigin(0.5).setAlpha(0.8);
    kreise[name] = kreis;
    objekte.push(kreis, text);
  }

  // Ein neuer Finger auf einem Aktionsknopf zählt als Tastendruck
  const beiBeruehrung = (zeiger) => {
    const name = knopfUnter(zeiger.x, zeiger.y, AKTIONEN);
    if (name) gedrueckt.add(name);
  };
  szene.input.on('pointerdown', beiBeruehrung);
  szene.events.once('shutdown', () => szene.input.off('pointerdown', beiBeruehrung));

  // Gehen: solange irgendein Finger auf dem Knopf liegt (auch wenn er dorthin gerutscht ist)
  const gehaltenTouch = (name) =>
    szene.input.manager.pointers.some((p) => p.isDown && knopfUnter(p.x, p.y, ['links', 'rechts']) === name);

  // Gedrückte Knöpfe kurz aufleuchten lassen
  szene.events.on('update', () => {
    for (const [name, kreis] of Object.entries(kreise)) {
      const an = AKTIONEN.includes(name)
        ? szene.input.manager.pointers.some((p) => p.isDown && knopfUnter(p.x, p.y, [name]))
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
