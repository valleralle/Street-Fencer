import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';

export default class TitelSzene extends Phaser.Scene {
  constructor() {
    super('TitelSzene');
  }

  create() {
    this.add
      .text(480, 120, 'game_pilot', { fontFamily: 'sans-serif', fontSize: '64px', color: '#ffffff' })
      .setOrigin(0.5);
    this.add
      .text(480, 180, 'Degenfechten', { fontFamily: 'sans-serif', fontSize: '24px', color: '#9aa3b5' })
      .setOrigin(0.5);

    erzeugeMenue(this, 480, 280, [
      { text: '2 Spieler', aktion: () => this.starteGefecht('zwei') },
      { text: 'Gegen Computer (kommt bald)' },
      { text: 'Steuerung', aktion: () => this.scene.start('SteuerungSzene', { danach: 'TitelSzene' }) },
    ]);

    this.add
      .text(480, 500, '↑ / ↓ wählen · Enter bestätigen', { fontFamily: 'sans-serif', fontSize: '16px', color: '#5d6578' })
      .setOrigin(0.5);
  }

  // Vor dem allerersten Gefecht wird einmal die Steuerung gezeigt
  starteGefecht(modus) {
    if (this.registry.get('steuerungGezeigt')) {
      this.scene.start('KampfSzene', { modus });
    } else {
      this.scene.start('SteuerungSzene', { danach: 'KampfSzene', modus });
    }
  }
}
