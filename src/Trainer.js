// Gegner im Training. Verhalten:
//   'stehen'    – steht still
//   'angreifen' – greift in ruhigem Rhythmus mit einfachen Stößen an (für Parade, Riposte, Tiefstoß)
//   'pariert'   – steht und pariert jeden Angriff, sobald er ausgeholt wird (fällt auf jede Finte herein)
//   'reaktionstest' – wie 'angreifen', aber in unregelmäßigem Rhythmus (Reaktionstest Parade, Issue #24)
// Bietet dieselbe Steuerung wie die Tastatur.
const ANGRIFFS_ABSTAND = 115; // so nah geht er heran, um zu stoßen (Stoß reicht bis etwa 131)
const PAUSE_ZWISCHEN_ANGRIFFEN = 2000;
const REAKTION = 200; // so schnell pariert er im Verhalten 'pariert'
// Im Reaktionstest wartet er zufällig zwischen PAUSE_MIN und PAUSE_MIN + PAUSE_SPANNE
const PAUSE_MIN = 700;
const PAUSE_SPANNE = 2300;

export default class Trainer {
  // verhalten siehe oben; zufall nur für den Reaktionstest
  constructor(verhalten = 'stehen', zufall = Math.random) {
    this.verhalten = verhalten;
    this.zufall = zufall;
    this.halte = { links: false, rechts: false };
    this.gedrueckteTasten = new Set();
    this.naechsterAngriff = 1000;
  }

  gehalten(name) {
    return this.halte[name];
  }

  gedrueckt(name) {
    return this.gedrueckteTasten.delete(name);
  }

  denke(jetzt, ich, gegner) {
    const vor = ich.richtung > 0 ? 'rechts' : 'links';
    const zurueck = ich.richtung > 0 ? 'links' : 'rechts';
    this.halte = { links: false, rechts: false };
    if (this.verhalten === 'pariert') {
      const start = gegner.aktion === 'stoss' || gegner.aktion === 'ausfall' ? gegner.aktionStart : null;
      if (start !== null && start !== this.gesehen) {
        this.gesehen = start;
        this.paradeUm = jetzt + REAKTION;
      }
      if (this.paradeUm !== undefined && jetzt >= this.paradeUm) {
        this.gedrueckteTasten.add('parade');
        this.paradeUm = undefined;
      }
      return;
    }
    if (!['angreifen', 'reaktionstest'].includes(this.verhalten) || ich.aktion || ich.offen) return;

    const abstand = Math.abs(gegner.x - ich.x);
    if (abstand > ANGRIFFS_ABSTAND + 8) this.halte[vor] = true;
    else if (abstand < ANGRIFFS_ABSTAND - 12) this.halte[zurueck] = true;
    else if (jetzt >= this.naechsterAngriff) {
      this.gedrueckteTasten.add('stoss');
      this.naechsterAngriff = jetzt + this.pause();
    }
  }

  // Wartezeit bis zum nächsten Angriff
  pause() {
    return this.verhalten === 'reaktionstest' ? PAUSE_MIN + this.zufall() * PAUSE_SPANNE : PAUSE_ZWISCHEN_ANGRIFFEN;
  }
}
