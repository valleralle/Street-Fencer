import { stil } from './schrift.js';

const FARBE = '#ffffff';
const AUSWAHL = '#ffd166';
const INAKTIV = '#5d6578';

// Senkrechtes Menü: ↑/↓ oder W/S wählen, Enter oder Leertaste bestätigt.
// eintraege = [{ text, aktion }] – ein Eintrag ohne aktion ist ausgegraut.
export default function erzeugeMenue(szene, x, y, eintraege, abstand = 46) {
  let index = eintraege.findIndex((e) => e.aktion);
  const texte = eintraege.map((e, i) =>
    szene.add.text(x, y + i * abstand, e.text, stil(28)).setOrigin(0.5),
  );

  const zeige = () => {
    texte.forEach((t, i) => {
      const e = eintraege[i];
      const gewaehlt = i === index;
      t.setText(gewaehlt ? `> ${e.text} <` : e.text);
      t.setColor(!e.aktion ? INAKTIV : gewaehlt ? AUSWAHL : FARBE);
    });
  };

  const bewege = (richtung) => {
    let i = index;
    do i = (i + richtung + eintraege.length) % eintraege.length;
    while (!eintraege[i].aktion);
    index = i;
    zeige();
  };

  const tastatur = szene.input.keyboard;
  tastatur.on('keydown-UP', () => bewege(-1));
  tastatur.on('keydown-W', () => bewege(-1));
  tastatur.on('keydown-DOWN', () => bewege(1));
  tastatur.on('keydown-S', () => bewege(1));
  tastatur.on('keydown-ENTER', () => eintraege[index].aktion());
  tastatur.on('keydown-SPACE', () => eintraege[index].aktion());

  zeige();
}
