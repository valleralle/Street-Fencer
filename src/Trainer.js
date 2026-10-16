// Gegner im Training: steht still oder greift in ruhigem Rhythmus mit einfachen Stößen an,
// damit man Parade, Riposte und Tiefstoß üben kann. Bietet dieselbe Steuerung wie die Tastatur.
const ANGRIFFS_ABSTAND = 115; // so nah geht er heran, um zu stoßen (Stoß reicht bis etwa 131)
const PAUSE_ZWISCHEN_ANGRIFFEN = 2000;

export default class Trainer {
  // verhalten = 'stehen' oder 'angreifen'
  constructor(verhalten = 'stehen') {
    this.verhalten = verhalten;
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
    if (this.verhalten !== 'angreifen' || ich.aktion || ich.offen) return;

    const abstand = Math.abs(gegner.x - ich.x);
    if (abstand > ANGRIFFS_ABSTAND + 8) this.halte[vor] = true;
    else if (abstand < ANGRIFFS_ABSTAND - 12) this.halte[zurueck] = true;
    else if (jetzt >= this.naechsterAngriff) {
      this.gedrueckteTasten.add('stoss');
      this.naechsterAngriff = jetzt + PAUSE_ZWISCHEN_ANGRIFFEN;
    }
  }
}
