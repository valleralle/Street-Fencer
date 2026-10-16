import { stil } from './schrift.js';

const FARBE = '#ffffff';
const AUSWAHL = '#ffd166';
const INAKTIV = '#5d6578';

// Senkrechtes Menü: ↑/↓ oder W/S wählen, Enter oder Leertaste bestätigt, ←/→ oder A/D ändern einen Wert.
// eintraege = [{ text, aktion, links, rechts }]
//   text   – Text oder Funktion, die den aktuellen Text liefert (z. B. „Musik < 50 % >“)
//   aktion – bei Enter; ein Eintrag ohne aktion, links und rechts ist ausgegraut
//   links / rechts – bei ←/→ (z. B. Lautstärke ändern)
// optionen: abstand (Zeilenabstand), groesse (Schriftgröße), gesperrt (Funktion: true = Eingaben ignorieren)
// Liefert { aktualisiere } zum Neuzeichnen, wenn sich Texte von außen geändert haben.
export default function erzeugeMenue(szene, x, y, eintraege, optionen = {}) {
  const { abstand = 46, groesse = 28, gesperrt = () => false } = typeof optionen === 'number' ? { abstand: optionen } : optionen;
  const waehlbar = (e) => e.aktion || e.links || e.rechts;
  const textVon = (e) => (typeof e.text === 'function' ? e.text() : e.text);

  let index = eintraege.findIndex(waehlbar);
  const texte = eintraege.map((e, i) => szene.add.text(x, y + i * abstand, textVon(e), stil(groesse)).setOrigin(0.5));

  const zeige = () => {
    texte.forEach((t, i) => {
      const e = eintraege[i];
      const gewaehlt = i === index;
      t.setText(gewaehlt ? `> ${textVon(e)} <` : textVon(e));
      t.setColor(!waehlbar(e) ? INAKTIV : gewaehlt ? AUSWAHL : FARBE);
    });
  };

  const bewege = (richtung) => {
    let i = index;
    do i = (i + richtung + eintraege.length) % eintraege.length;
    while (!waehlbar(eintraege[i]));
    index = i;
    zeige();
  };

  const wenn = (fn) => () => {
    if (!gesperrt()) fn();
  };
  const tastatur = szene.input.keyboard;
  for (const taste of ['UP', 'W']) tastatur.on(`keydown-${taste}`, wenn(() => bewege(-1)));
  for (const taste of ['DOWN', 'S']) tastatur.on(`keydown-${taste}`, wenn(() => bewege(1)));
  for (const [taste, art] of [['LEFT', 'links'], ['A', 'links'], ['RIGHT', 'rechts'], ['D', 'rechts']]) {
    tastatur.on(
      `keydown-${taste}`,
      wenn(() => {
        eintraege[index][art]?.();
        zeige();
      }),
    );
  }
  for (const taste of ['ENTER', 'SPACE']) {
    tastatur.on(
      `keydown-${taste}`,
      wenn(() => {
        eintraege[index].aktion?.();
        zeige();
      }),
    );
  }

  // Antippen oder Anklicken wählt einen Eintrag und löst ihn aus
  texte.forEach((t, i) => {
    const e = eintraege[i];
    if (!waehlbar(e)) return;
    t.setPadding(16, 6).setInteractive({ useHandCursor: true });
    t.on('pointerdown', (zeiger) =>
      wenn(() => {
        index = i;
        if (e.aktion) e.aktion();
        // Werte: linke Hälfte verringert, rechte Hälfte erhöht
        else if (zeiger.x < t.x) e.links?.();
        else e.rechts?.();
        zeige();
      })(),
    );
  });

  zeige();
  return { aktualisiere: zeige };
}
