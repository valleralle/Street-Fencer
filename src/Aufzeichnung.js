// Ringpuffer für die Wiederholung am Gefechtsende (Issue #29): hält je Bild den Zustand beider Fechter,
// aber nur die letzten `dauer` Millisekunden. Ohne Grafik – die Szene zeichnet daraus.
export default class Aufzeichnung {
  constructor(dauer = 3000) {
    this.dauer = dauer;
    this.bilder = [];
  }

  // zeit in Spielzeit; bild = beliebiges Objekt (z. B. { rot, gruen } aus Fechter.momentaufnahme)
  nimmAuf(zeit, bild) {
    this.bilder.push({ zeit, ...bild });
    const grenze = zeit - this.dauer;
    let alt = 0;
    while (alt < this.bilder.length && this.bilder[alt].zeit < grenze) alt++;
    if (alt) this.bilder.splice(0, alt);
  }

  // Die Bilder ab `von` (Spielzeit), älteste zuerst
  ab(von) {
    return this.bilder.filter((b) => b.zeit >= von);
  }

  // Die Bilder der letzten ms Millisekunden vor dem jüngsten, älteste zuerst
  letzte(ms) {
    const neuestes = this.bilder.at(-1);
    return neuestes ? this.ab(neuestes.zeit - ms) : [];
  }

  leere() {
    this.bilder = [];
  }
}

// Was ein Fechter in den aufgezeichneten Bildern getan hat, z. B. ['finte', 'ausfall'].
// Ein abgebrochener Angriff (die Zahl seiner Finten steigt) wird zur Finte.
export function aktionsFolge(bilder, farbe) {
  const folge = [];
  let laufend = null;
  let finten = bilder[0]?.[farbe].finten;
  for (const bild of bilder) {
    const f = bild[farbe];
    if (f.finten > finten && laufend && folge.length) folge[folge.length - 1] = 'finte';
    finten = f.finten;
    const kennung = f.aktion ? `${f.aktion}@${f.aktionStart}` : null;
    if (kennung && kennung !== laufend) folge.push(f.aktion);
    laufend = kennung;
  }
  return folge;
}
