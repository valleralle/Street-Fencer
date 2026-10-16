import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { musik } from '../musik.js';

export default class TitelSzene extends Phaser.Scene {
  constructor() {
    super('TitelSzene');
  }

  create() {
    this.add
      .text(480, 120, 'Street Fencer', stil(72))
      .setOrigin(0.5);
    this.add
      .text(480, 185, 'Degenfechten', stil(28, '#9aa3b5'))
      .setOrigin(0.5);

    erzeugeMenue(this, 480, 260, [
      { text: 'Training', aktion: () => this.scene.start('TrainingSzene') },
      { text: '2 Spieler', aktion: () => this.starteGefecht('zwei') },
      { text: 'Gegen Computer', aktion: () => this.scene.start('StufenSzene') },
      { text: 'Steuerung', aktion: () => this.scene.start('SteuerungSzene', { danach: 'TitelSzene' }) },
      { text: 'Einstellungen', aktion: () => this.scene.start('EinstellungenSzene') },
    ]);
    musik.spiele('titel', this.sound.context);

    this.add
      .text(480, 500, '↑ / ↓ wählen · Enter bestätigen', stil(18, '#5d6578'))
      .setOrigin(0.5);
  }

  starteGefecht(modus) {
    starteGefecht(this, { modus });
  }
}

// Vor dem allerersten Gefecht wird einmal die Steuerung gezeigt
export function starteGefecht(szene, daten) {
  if (szene.registry.get('steuerungGezeigt')) {
    szene.scene.start('KampfSzene', daten);
  } else {
    szene.scene.start('SteuerungSzene', { danach: 'KampfSzene', ...daten });
  }
}
