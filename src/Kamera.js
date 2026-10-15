// Kamera für die KampfSzene: nah dran und folgt der Mitte zwischen den Fechtern.
// Zoom 1,5 macht aus einem Bildpixel (2 Weltpixel) genau 3 Bildschirmpixel – die Pixelart bleibt scharf.
// Stehen die Fechter weit auseinander, zoomt sie auf die volle Fechtbahn heraus.
const NAH = 1.5;
const FERN = 1;
const RAUSZOOMEN_AB = 460; // Abstand der Fechter, ab dem herausgezoomt wird …
const REINZOOMEN_UNTER = 380; // … und unter dem wieder heran
const NACHZIEHEN = 150; // je größer, desto gemächlicher folgt die Kamera (ms)

const BREITE = 960;
const HOEHE = 540;

export default class Kamera {
  // uiObjekte bleiben fest am Bildschirm und werden nicht gezoomt (Meldegerät, Texte)
  constructor(szene, uiObjekte) {
    this.welt = szene.cameras.main.setBounds(0, 0, BREITE, HOEHE).setRoundPixels(true);
    this.ui = szene.cameras.add(0, 0, BREITE, HOEHE);
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
  stelle() {
    const sichtHoehe = HOEHE / this.zoom;
    this.welt.setZoom(this.zoom).centerOn(this.x, HOEHE - sichtHoehe / 2);
  }
}
