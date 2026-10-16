import Phaser from 'phaser';
import { BREITE, HOEHE, FARBEN, POSEN } from './fechterPosen.js';
import { texturName } from './namen.js';

export { texturName };

// Macht aus den Textrastern für jede Pose eine Textur mit der passenden Schuhfarbe
export function erzeugeFechterTexturen(szene, farbe, schuhfarbe) {
  const farben = { ...FARBEN, S: schuhfarbe, T: schuhfarbe }; // Schuhe und Handschuh
  for (const [pose, { pixel }] of Object.entries(POSEN)) {
    const name = texturName(farbe, pose);
    if (szene.textures.exists(name)) continue;

    const textur = szene.textures.createCanvas(name, BREITE, HOEHE);
    const ctx = textur.getContext();
    pixel.forEach((zeile, y) => {
      [...zeile].forEach((zeichen, x) => {
        if (zeichen === '.') return;
        ctx.fillStyle = farben[zeichen];
        ctx.fillRect(x, y, 1, 1);
      });
    });
    textur.refresh();
    // Harte Pixelkanten beim Vergrößern statt Weichzeichnen
    textur.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}
