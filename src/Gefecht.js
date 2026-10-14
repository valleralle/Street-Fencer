export const SIEGTREFFER = 5;
export const GEFECHTSZEIT = 180_000;
export const VERLAENGERUNG = 60_000;

// Regeln eines Gefechts: Punkte, Zeit, Verlängerung und Vorteil.
// Kennt keine Grafik – die KampfSzene meldet Treffer und vergangene Zeit.
export default class Gefecht {
  constructor(zufall = Math.random) {
    this.zufall = zufall;
    this.stand = { rot: 0, gruen: 0 };
    this.restzeit = GEFECHTSZEIT;
    this.verlaengerung = false;
    this.vorteil = null;
    this.sieger = null;
  }

  get entscheidend() {
    return (
      this.verlaengerung ||
      (this.stand.rot === SIEGTREFFER - 1 && this.stand.gruen === SIEGTREFFER - 1)
    );
  }

  // treffer = { rot, gruen }: wer getroffen hat. Liefert 'treffer', 'doppeltreffer' oder 'gestrichen'.
  werteAus(treffer) {
    if (treffer.rot && treffer.gruen) {
      if (this.entscheidend) return 'gestrichen';
      this.stand.rot++;
      this.stand.gruen++;
      this.pruefeSieg();
      return 'doppeltreffer';
    }
    const farbe = treffer.rot ? 'rot' : 'gruen';
    this.stand[farbe]++;
    if (this.verlaengerung) this.sieger = farbe;
    else this.pruefeSieg();
    return 'treffer';
  }

  pruefeSieg() {
    if (this.stand.rot >= SIEGTREFFER) this.sieger = 'rot';
    else if (this.stand.gruen >= SIEGTREFFER) this.sieger = 'gruen';
  }

  // Liefert null, 'verlaengerung' oder 'ende', wenn die Zeit gerade abgelaufen ist
  zeitVergeht(ms) {
    this.restzeit = Math.max(0, this.restzeit - ms);
    if (this.restzeit > 0) return null;

    if (this.verlaengerung) {
      this.sieger = this.vorteil;
      return 'ende';
    }
    if (this.stand.rot !== this.stand.gruen) {
      this.sieger = this.stand.rot > this.stand.gruen ? 'rot' : 'gruen';
      return 'ende';
    }
    this.verlaengerung = true;
    this.restzeit = VERLAENGERUNG;
    this.vorteil = this.zufall() < 0.5 ? 'rot' : 'gruen';
    return 'verlaengerung';
  }
}
