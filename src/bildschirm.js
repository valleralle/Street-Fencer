// Alle Bildschirme sind für 960 × 540 gebaut. Auf dem Handy füllt das Spiel trotzdem den ganzen
// Bildschirm (Scale-Modus EXPAND, siehe main.js): das Spielbild wird breiter (oder höher) als
// 960 × 540, und die Kameras zeigen die 960 × 540 in der Mitte. Am Rand ist dann etwas mehr
// Hintergrund zu sehen; Knöpfe und Pausenzeichen rücken an den echten Bildschirmrand.
export const BREITE = 960;
export const HOEHE = 540;

// Wie viel das Spielbild links/rechts (x) und oben/unten (y) über 960 × 540 hinausgeht – je Seite
export function rand(szene) {
  const { width, height } = szene.scale.gameSize;
  return { x: (width - BREITE) / 2, y: (height - HOEHE) / 2 };
}

// Verschiebt alle Kameras der Szene so, dass 960 × 540 mittig im Bild liegen
export function zentriereKameras(szene) {
  const r = rand(szene);
  for (const kamera of szene.cameras.cameras) kamera.setScroll(-r.x, -r.y);
}

// Hält ein Objekt am rechten bzw. linken Bildschirmrand: x ist die Lage im 960 breiten Bild
export const amRechtenRand = (szene, objekt, x) => amRand(szene, objekt, x, 1);
export const amLinkenRand = (szene, objekt, x) => amRand(szene, objekt, x, -1);

function amRand(szene, objekt, x, seite) {
  const setze = () => objekt.setX(x + seite * rand(szene).x);
  setze();
  szene.scale.on('resize', setze);
  szene.events.once('shutdown', () => szene.scale.off('resize', setze));
}

// Ruft zentriereKameras für jeden Bildschirm nach create() und bei jeder Größenänderung auf.
// Die Kamera im Gefecht (Kamera.js) stellt sich in jedem Bild selbst ein.
// Die Szenen gibt es erst, wenn das Spiel bereit ist; die erste läuft dann schon.
export function zentriereAlleSzenen(spiel) {
  spiel.events.once('ready', () => {
    for (const szene of spiel.scene.scenes) {
      const zentriere = () => zentriereKameras(szene);
      const einrichten = () => {
        zentriere();
        szene.scale.on('resize', zentriere);
        szene.events.once('shutdown', () => szene.scale.off('resize', zentriere));
      };
      szene.events.on('create', einrichten);
      if (szene.sys.isActive()) einrichten();
    }
  });
}
