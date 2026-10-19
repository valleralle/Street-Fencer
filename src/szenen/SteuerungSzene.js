import Phaser from 'phaser';
import { stil } from '../schrift.js';
import { FECHTERFARBEN } from '../farben.js';
import { einstellungen, tastenName, aktionsName } from '../einstellungen.js';
import { istTouchGeraet, knopfText } from '../touch.js';
import { text } from '../texte.js';

// Tabelle der aktuellen Tastenbelegung (siehe Einstellungen)
function zeilen() {
  const { rot, gruen } = einstellungen.tasten;
  const bewegen = (t) =>
    t.links === 'LEFT' && t.rechts === 'RIGHT' ? text('taste.pfeileLinksRechts') : `${tastenName(t.links)} / ${tastenName(t.rechts)}`;
  return [
    ['', text('steuerung.kopfRot'), text('steuerung.kopfGruen')],
    [text('steuerung.bewegen'), bewegen(rot), bewegen(gruen)],
    ...['stoss', 'parade', 'tiefstoss', 'fleche'].map((a) => [aktionsName(a), tastenName(rot[a]), tastenName(gruen[a])]),
  ];
}

export default class SteuerungSzene extends Phaser.Scene {
  constructor() {
    super('SteuerungSzene');
  }

  init(daten) {
    this.danach = daten.danach ?? 'TitelSzene';
    this.daten = daten;
  }

  create() {
    this.registry.set('steuerungGezeigt', true);
    const schrift = stil(24);
    const los = () => this.scene.start(this.danach, this.daten);
    this.input.keyboard.on('keydown-ENTER', los);
    this.input.keyboard.on('keydown-SPACE', los);
    this.input.keyboard.on('keydown-ESC', los);
    if (istTouchGeraet(this)) {
      this.zeigeTouch(schrift);
      this.input.once('pointerdown', los);
      return;
    }

    this.add.text(480, 44, text('titel.steuerung'), { ...schrift, fontSize: '40px' }).setOrigin(0.5);

    const spalten = [250, 480, 720];
    const farben = ['#9aa3b5', FECHTERFARBEN.rot, FECHTERFARBEN.gruen];
    zeilen().forEach((zeile, z) => {
      zeile.forEach((zelle, s) => {
        const farbe = z === 0 || s === 0 ? farben[z === 0 ? s : 0] : '#ffffff';
        this.add.text(spalten[s], 105 + z * 38, zelle, { ...schrift, color: farbe }).setOrigin(0.5);
      });
    });

    this.add
      .text(
        480,
        350,
        text('steuerung.regeln'),
        { ...schrift, fontSize: '19px', align: 'center', color: '#c8ccd4', lineSpacing: 8 },
      )
      .setOrigin(0.5, 0);

    const weiter = text(this.danach === 'KampfSzene' ? 'steuerung.losTasten' : 'steuerung.zurueckTasten');
    this.add.text(480, 480, weiter, { ...schrift, color: '#ffd166' }).setOrigin(0.5);
  }

  // Erklärung der Knöpfe am Bildschirm (siehe touch.js)
  zeigeTouch(schrift) {
    this.add.text(480, 50, text('titel.steuerung'), { ...schrift, fontSize: '40px' }).setOrigin(0.5);
    const knopf = Object.fromEntries(['links', 'rechts', 'stoss', 'parade', 'tiefstoss', 'fleche'].map((n) => [n, knopfText(n)]));
    const zeilen = [
      [text('steuerung.touchGehenKnopf', knopf), text('steuerung.touchGehen')],
      [knopf.stoss, text('steuerung.touchStoss')],
      [text('steuerung.touchAusfallKnopf', knopf), text('steuerung.touchAusfall')],
      [knopf.parade, text('steuerung.touchParade')],
      [knopf.tiefstoss, text('steuerung.touchTief')],
      [knopf.fleche, text('steuerung.touchFleche')],
    ];
    zeilen.forEach(([knopf, wirkung], z) => {
      this.add.text(400, 115 + z * 40, knopf, { ...schrift, color: FECHTERFARBEN.rot }).setOrigin(1, 0.5);
      this.add.text(430, 115 + z * 40, wirkung, schrift).setOrigin(0, 0.5);
    });
    this.add
      .text(
        480,
        370,
        text('steuerung.touchRegeln'),
        { ...schrift, fontSize: '19px', align: 'center', color: '#c8ccd4', lineSpacing: 8 },
      )
      .setOrigin(0.5, 0);
    const weiter = text(this.danach === 'KampfSzene' ? 'steuerung.losTouch' : 'steuerung.zurueckTouch');
    this.add.text(480, 490, weiter, { ...schrift, color: '#ffd166' }).setOrigin(0.5);
  }
}
