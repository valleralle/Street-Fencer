import Phaser from 'phaser';

const BAHN_Y = 400;
const TEMPO = 220;

export default class KampfSzene extends Phaser.Scene {
  constructor() {
    super('KampfSzene');
  }

  create() {
    // Fechtbahn
    this.add.rectangle(480, BAHN_Y + 40, 900, 8, 0xdddddd);

    // Platzhalter-Fechter (werden später durch Sprites ersetzt)
    this.spieler1 = this.erzeugeFechter(300, 0x4fa3ff);
    this.spieler2 = this.erzeugeFechter(660, 0xff5f5f);

    this.tasten1 = this.input.keyboard.addKeys({ links: 'A', rechts: 'D' });
    this.tasten2 = this.input.keyboard.addKeys({ links: 'LEFT', rechts: 'RIGHT' });

    this.add
      .text(480, 40, 'Spieler 1: A / D     Spieler 2: ← / →', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }

  erzeugeFechter(x, farbe) {
    const fechter = this.add.rectangle(x, BAHN_Y, 40, 80, farbe);
    this.physics.add.existing(fechter);
    fechter.body.setCollideWorldBounds(true);
    return fechter;
  }

  bewege(fechter, tasten) {
    let vx = 0;
    if (tasten.links.isDown) vx -= TEMPO;
    if (tasten.rechts.isDown) vx += TEMPO;
    fechter.body.setVelocityX(vx);
  }

  update() {
    this.bewege(this.spieler1, this.tasten1);
    this.bewege(this.spieler2, this.tasten2);
  }
}
