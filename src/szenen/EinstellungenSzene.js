import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { einstellungen, aendereLautstaerke, speichereEinstellungen, setzeZurueck } from '../einstellungen.js';
import { musik } from '../musik.js';

const prozent = (wert) => `${Math.round(wert * 100)} %`;

export default class EinstellungenSzene extends Phaser.Scene {
  constructor() {
    super('EinstellungenSzene');
  }

  create() {
    this.add.text(480, 80, 'Einstellungen', stil(56)).setOrigin(0.5);

    const lautstaerke = (art, name) => ({
      text: () => `${name}: ${prozent(einstellungen[art])}`,
      links: () => this.aendere(art, -1),
      rechts: () => this.aendere(art, 1),
    });
    erzeugeMenue(this, 480, 180, [
      lautstaerke('musik', 'Musik'),
      lautstaerke('effekte', 'Effekte'),
      { text: 'Tasten Rot', aktion: () => this.scene.start('TastenSzene', { farbe: 'rot' }) },
      { text: 'Tasten Grün', aktion: () => this.scene.start('TastenSzene', { farbe: 'gruen' }) },
      {
        text: 'Standard wiederherstellen',
        aktion: () => {
          setzeZurueck(einstellungen);
          speichereEinstellungen(einstellungen);
          musik.aktualisiereLautstaerke();
        },
      },
      { text: 'Zurück', aktion: () => this.scene.start('TitelSzene') },
    ]);

    this.add
      .text(480, 500, '↑ / ↓ wählen · Lautstärke mit A / D bzw. den Pfeiltasten · Esc zurück', stil(16, '#5d6578'))
      .setOrigin(0.5);
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('TitelSzene'));
    musik.spiele('titel', this.sound.context);
  }

  aendere(art, schritte) {
    aendereLautstaerke(einstellungen, art, schritte);
    speichereEinstellungen(einstellungen);
    musik.aktualisiereLautstaerke();
  }
}
