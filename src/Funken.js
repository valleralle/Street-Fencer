// Funken, wenn Klinge auf Klinge trifft: kleine Pixelquadrate, die auseinanderstieben,
// nach unten fallen und von Weiß über Gelb zu Orange verglühen.
const SCHWERKRAFT = 900; // px/s²
const PIXEL = 2; // so groß wie ein Bildpixel der Fechter
const FARBEN = [0xffffff, 0xffe38a, 0xffb347, 0xe0702a]; // vom heißen Anfang bis zum Verglühen

export default class Funken {
  constructor(szene, zufall = Math.random) {
    this.grafik = szene.add.graphics();
    this.zufall = zufall;
    this.teile = [];
  }

  // x, y = Berührungspunkt; richtung = wohin der Parierende schaut (Funken fliegen zum Angreifer hin)
  spruehe(x, y, richtung, anzahl = 26) {
    for (let i = 0; i < anzahl; i++) {
      this.teile.push({
        x,
        y,
        vx: (this.zufall() * 2 - 0.6) * 200 * richtung,
        vy: -60 - this.zufall() * 240,
        alter: 0,
        leben: 250 + this.zufall() * 300,
      });
    }
  }

  aktualisiere(delta) {
    const s = delta / 1000;
    for (const t of this.teile) {
      t.alter += delta;
      t.x += t.vx * s;
      t.y += t.vy * s;
      t.vy += SCHWERKRAFT * s;
    }
    this.teile = this.teile.filter((t) => t.alter < t.leben);

    const g = this.grafik.clear();
    for (const t of this.teile) {
      const anteil = t.alter / t.leben;
      g.fillStyle(FARBEN[Math.min(FARBEN.length - 1, Math.floor(anteil * FARBEN.length))], 1 - anteil * 0.6);
      // frische Funken sind etwas größer
      const groesse = anteil < 0.3 ? PIXEL * 2 : PIXEL;
      g.fillRect(Math.round(t.x / PIXEL) * PIXEL, Math.round(t.y / PIXEL) * PIXEL, groesse, groesse);
    }
  }
}
