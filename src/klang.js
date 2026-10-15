// Alle Töne des Spiels, direkt im Browser erzeugt – ohne Sounddateien.
// ctx ist der AudioContext von Phaser (szene.sound.context); fehlt er, bleibt es still.

const SIGNALTON_HZ = 880;
const SIGNALTON_DAUER = 0.7;

// Lauter, gleichmäßiger Piepton des Meldegeräts bei einem Treffer
export function signalton(ctx) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const ton = ctx.createOscillator();
  const lautstaerke = ctx.createGain();
  ton.type = 'square';
  ton.frequency.value = SIGNALTON_HZ;
  lautstaerke.gain.setValueAtTime(0.06, t);
  lautstaerke.gain.setValueAtTime(0.06, t + SIGNALTON_DAUER - 0.05);
  lautstaerke.gain.linearRampToValueAtTime(0, t + SIGNALTON_DAUER);
  ton.connect(lautstaerke).connect(ctx.destination);
  ton.start(t);
  ton.stop(t + SIGNALTON_DAUER);
}

// Metallischer Klang, wenn Klinge auf Klinge trifft (gelungene Parade):
// ein kurzes Klicken und darüber mehrere unharmonische Obertöne, die schnell verklingen
export function klingenschlag(ctx) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const verstimmung = 0.97 + Math.random() * 0.06; // jeder Schlag klingt etwas anders
  for (const [hz, laut, dauer] of [[2350, 0.05, 0.35], [3810, 0.035, 0.25], [5230, 0.025, 0.18], [6970, 0.015, 0.12]]) {
    const ton = ctx.createOscillator();
    const lautstaerke = ctx.createGain();
    ton.type = 'sine';
    ton.frequency.value = hz * verstimmung;
    lautstaerke.gain.setValueAtTime(laut, t);
    lautstaerke.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    ton.connect(lautstaerke).connect(ctx.destination);
    ton.start(t);
    ton.stop(t + dauer);
  }
  rauschen(ctx, { dauer: 0.03, frequenz: 4000, laut: 0.08 });
}

// Leises Zischen, wenn die Klinge nach vorn schnellt
export function luftzug(ctx) {
  if (!ctx) return;
  rauschen(ctx, { dauer: 0.12, frequenz: 1800, laut: 0.035, gleitend: true });
}

// Gefiltertes Rauschen; gleitend = die Filterfrequenz fällt, das klingt wie vorbeiziehende Luft
function rauschen(ctx, { dauer, frequenz, laut, gleitend = false }) {
  const t = ctx.currentTime;
  const puffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dauer), ctx.sampleRate);
  const daten = puffer.getChannelData(0);
  for (let i = 0; i < daten.length; i++) daten[i] = Math.random() * 2 - 1;

  const quelle = ctx.createBufferSource();
  quelle.buffer = puffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(frequenz, t);
  if (gleitend) filter.frequency.exponentialRampToValueAtTime(frequenz / 3, t + dauer);
  const lautstaerke = ctx.createGain();
  lautstaerke.gain.setValueAtTime(laut, t);
  lautstaerke.gain.exponentialRampToValueAtTime(0.0001, t + dauer);

  quelle.connect(filter).connect(lautstaerke).connect(ctx.destination);
  quelle.start(t);
}
