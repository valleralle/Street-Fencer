import Phaser from 'phaser';
import erzeugeMenue from '../Menue.js';
import { stil } from '../schrift.js';
import { einstellungen, aendereLautstaerke, speichereEinstellungen, setzeZurueck, wechsleSprache } from '../einstellungen.js';
import { text, farbname, wendeSpracheAufSeiteAn } from '../texte.js';
import { musik } from '../musik.js';
import { istTouchGeraet } from '../touch.js';

const prozent = (wert) => `${Math.round(wert * 100)} %`;

export default class EinstellungenSzene extends Phaser.Scene {
  constructor() {
    super('EinstellungenSzene');
  }

  create() {
    this.add.text(480, 80, text('titel.einstellungen'), stil(56)).setOrigin(0.5);
    const touch = istTouchGeraet(this);

    const lautstaerke = (art) => ({
      text: () => text(`einstellungen.${art}`, { wert: prozent(einstellungen[art]) }),
      links: () => this.aendere(art, -1),
      rechts: () => this.aendere(art, 1),
    });
    // Sprachwechsel: der Bildschirm wird neu aufgebaut, damit alle Texte die neue Sprache zeigen
    const sprache = (schritte) => () => {
      wechsleSprache(einstellungen, schritte);
      speichereEinstellungen(einstellungen);
      wendeSpracheAufSeiteAn();
      this.scene.restart();
    };
    erzeugeMenue(this, 480, 170, [
      lautstaerke('musik'),
      lautstaerke('effekte'),
      { text: text('einstellungen.sprache', { wert: text(`sprache.${einstellungen.sprache}`) }), aktion: sprache(1), links: sprache(-1), rechts: sprache(1) },
      // Tastenbelegung nur, wenn es eine Tastatur gibt
      ...(touch
        ? []
        : [
            ...['rot', 'gruen'].map((farbe) => ({
              text: text('einstellungen.tasten', { farbe: farbname(farbe) }),
              aktion: () => this.scene.start('TastenSzene', { farbe }),
            })),
          ]),
      {
        text: text('einstellungen.standard'),
        aktion: () => {
          setzeZurueck(einstellungen);
          speichereEinstellungen(einstellungen);
          musik.aktualisiereLautstaerke();
        },
      },
      { text: text('zurueck'), aktion: () => this.scene.start('TitelSzene') },
    ]);

    this.add
      .text(
        480,
        500,
        text(touch ? 'einstellungen.hinweisTouch' : 'einstellungen.hinweisTasten'),
        stil(16, '#5d6578'),
      )
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
