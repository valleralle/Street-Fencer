// Kamera für die KampfSzene: nah dran und folgt der Mitte zwischen den Fechtern.
// Zoom 1,5 macht aus einem Bildpixel (2 Weltpixel) genau 3 Bildschirmpixel – die Pixelart bleibt scharf.
// Stehen die Fechter weit auseinander, zoomt sie auf die volle Fechtbahn heraus.
// Ist das Bild breiter als 960 (Handy), zeigt sie links und rechts mehr von der Halle (siehe bildschirm.js).
import { BREITE, HOEHE, rand } from './bildschirm.js';

const NAH = 1.5;
const FERN = 1;
const RAUSZOOMEN_AB = 460; // Abstand der Fechter, ab dem herausgezoomt wird …
const REINZOOMEN_UNTER = 380; // … und unter dem wieder heran
const NACHZIEHEN = 150; // je größer, desto gemächlicher folgt die Kamera (ms)

export default class Kamera {
  // uiObjekte bleiben fest am Bildschirm und werden nicht gezoomt (Meldegerät, Texte)
  constructor(szene, uiObjekte) {
    this.szene = szene;
    this.welt = szene.cameras.main.setRoundPixels(true);
    this.ui = szene.cameras.add(0, 0, szene.scale.width, szene.scale.height);
    this.welt.ignore(uiObjekte);
    this.ui.ignore(szene.children.list.filter((o) => !uiObjekte.includes(o)));

    this.zoom = NAH;
    this.zielZoom = NAH;
    this.x = BREITE / 2;
    this.stelle();
  }

  folge(delta, rot, gruen) {
    const abstand = gruen.x - rot.x;
    if (abstand > RAUSZOOMEN_AB) this.zielZoom = FERN;
    else if (abstand < REINZOOMEN_UNTER) this.zielZoom = NAH;

    const anteil = Math.min(1, delta / NACHZIEHEN);
    this.zoom += (this.zielZoom - this.zoom) * anteil;
    if (Math.abs(this.zielZoom - this.zoom) < 0.01) this.zoom = this.zielZoom;
    this.x += ((rot.x + gruen.x) / 2 - this.x) * anteil;
    this.stelle();
  }

  // Unten bündig mit dem Bildrand, damit die Fechtbahn immer ganz unten im Bild liegt
  // Die Grenzen wachsen mit dem Bild: zur Seite gleichmäßig, nach oben (die Fechtbahn bleibt unten)
  stelle() {
    const r = rand(this.szene);
    const hoehe = HOEHE + 2 * r.y;
    const sichtHoehe = hoehe / this.zoom;
    this.welt.setBounds(-r.x, HOEHE - hoehe, BREITE + 2 * r.x, hoehe);
    this.welt.setZoom(this.zoom).centerOn(this.x, HOEHE - sichtHoehe / 2);
    this.ui.setScroll(-r.x, -r.y);
  }
}
