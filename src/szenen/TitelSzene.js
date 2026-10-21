import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { musik } from '../musik.js';
import { istTouchGeraet } from '../touch.js';
import { text } from '../texte.js';

export default class TitelSzene extends Phaser.Scene {
  constructor() {
    super('TitelSzene');
  }

  create() {
    this.add
      .text(480, 120, 'Street Fencer', stil(72))
      .setOrigin(0.5);
    this.add
      .text(480, 185, text('titel.untertitel'), stil(28, '#9aa3b5'))
      .setOrigin(0.5);

    // Auf dem Handy fehlt nur „2 Spieler“ – zwei Spieler hätten an einem Handy zu wenig Platz
    const touch = istTouchGeraet(this);
    const eintraege = [
      { text: text('titel.training'), aktion: () => this.scene.start('TrainingSzene') },
      { text: text('titel.zweiSpieler'), aktion: () => this.starteGefecht('zwei'), nurTastatur: true },
      { text: text('titel.computer'), aktion: () => this.scene.start('StufenSzene') },
      { text: text('titel.fortschritt'), aktion: () => this.scene.start('FortschrittSzene') },
      { text: text('titel.erfolge'), aktion: () => this.scene.start('ErfolgeSzene') },
      { text: text('titel.steuerung'), aktion: () => this.scene.start('SteuerungSzene', { danach: 'TitelSzene' }) },
      { text: text('titel.einstellungen'), aktion: () => this.scene.start('EinstellungenSzene') },
    ];
    erzeugeMenue(this, 480, touch ? 240 : 232, touch ? eintraege.filter((e) => !e.nurTastatur) : eintraege, { abstand: touch ? 40 : 36 });
    musik.spiele('titel', this.sound.context);

    this.add
      .text(480, 500, text(touch ? 'titel.hinweisTouch' : 'titel.hinweisTasten'), stil(18, '#5d6578'))
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
