// Issue #24: Medaillen im Training und Reaktionstest Parade
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRENZEN,
  medaille,
  trageLektionEin,
  besteMedaille,
  alleGeschafft,
  werteReaktionstestAus,
  istBesser,
  trageReaktionstestEin,
  ladeTraining,
  speichereTraining,
  sekunden,
} from '../src/Trainingswertung.js';
import Trainer from '../src/Trainer.js';
import { LEKTIONEN } from '../src/lektionen.js';
import { lektionsZeit, SPIELER } from './trainingsspieler.js';
import { zweiFechter, zufall, BILD } from './hilfen.js';

const leer = () => ladeTraining(null);

test('jede Lektion hat Medaillengrenzen und einen Test-Spieler', () => {
  for (const l of LEKTIONEN) {
    assert.ok(GRENZEN[l.id], l.id);
    assert.ok(SPIELER[l.id], l.id);
  }
});

test('Gold ist mit menschlicher Reaktionszeit und 2,5 s zum Lesen erreichbar, aber nicht geschenkt', () => {
  for (const l of LEKTIONEN) {
    const zeit = lektionsZeit(l.id);
    assert.ok(zeit !== null, `${l.id}: der Test-Spieler schafft die Lektion nicht`);
    const [gold, silber] = GRENZEN[l.id];
    assert.equal(medaille(l.id, zeit + 2500), 'gold', `${l.id}: ${zeit} ms + 2,5 s`);
    assert.ok(gold - zeit <= 3000, `${l.id}: Gold ist zu leicht (${zeit} ms, Grenze ${gold})`);
    assert.equal(silber, 3 * gold);
  }
});

test('die Medaille richtet sich nach der Zeit: Gold, Silber, sonst Bronze', () => {
  const [gold, silber] = GRENZEN.stoss;
  assert.equal(medaille('stoss', gold), 'gold');
  assert.equal(medaille('stoss', gold + 1), 'silber');
  assert.equal(medaille('stoss', silber), 'silber');
  assert.equal(medaille('stoss', silber + 1), 'bronze');
  assert.equal(medaille('stoss', 600_000), 'bronze');
});

test('die Bestleistung je Lektion bleibt die schnellste Zeit', () => {
  let e = trageLektionEin(leer(), 'parade', 9000);
  assert.deepEqual([e.medaille, e.bestleistung, e.erstesMal], ['silber', false, true]);
  assert.equal(besteMedaille(e.daten, 'parade'), 'silber');
  e = trageLektionEin(e.daten, 'parade', 4000);
  assert.deepEqual([e.medaille, e.bestleistung], ['gold', true]);
  e = trageLektionEin(e.daten, 'parade', 20000);
  assert.deepEqual([e.medaille, e.bestleistung], ['bronze', false]);
  assert.equal(e.daten.lektionen.parade, 4000);
  assert.equal(besteMedaille(e.daten, 'parade'), 'gold');
  assert.equal(besteMedaille(e.daten, 'stoss'), null);
});

test('alle Lektionen geschafft, sobald jede eine Bestzeit hat', () => {
  let daten = leer();
  for (const l of LEKTIONEN) {
    assert.ok(!alleGeschafft(daten));
    daten = trageLektionEin(daten, l.id, 5000).daten;
  }
  assert.ok(alleGeschafft(daten));
});

test('der Reaktionstest zählt Paraden und mittelt die Reaktionszeit der gelungenen', () => {
  const versuche = [
    { pariert: true, reaktion: 300 },
    { pariert: false, reaktion: null },
    { pariert: true, reaktion: 250 },
    { pariert: true, reaktion: 251 },
  ];
  assert.deepEqual(werteReaktionstestAus(versuche), { paraden: 3, angriffe: 4, mittel: 267 });
  assert.deepEqual(werteReaktionstestAus([{ pariert: false, reaktion: null }]), { paraden: 0, angriffe: 1, mittel: null });
});

test('besser ist, wer mehr pariert, bei Gleichstand der Schnellere', () => {
  const r = (paraden, mittel) => ({ paraden, angriffe: 10, mittel });
  assert.ok(istBesser(r(8, 400), r(7, 200)));
  assert.ok(istBesser(r(8, 300), r(8, 310)));
  assert.ok(!istBesser(r(8, 310), r(8, 300)));
  assert.ok(istBesser(r(1, 500), null));
  assert.ok(!istBesser(r(0, null), null));
  let e = trageReaktionstestEin(leer(), r(6, 320));
  assert.ok(e.bestleistung);
  e = trageReaktionstestEin(e.daten, r(5, 200));
  assert.ok(!e.bestleistung);
  assert.deepEqual(e.daten.reaktionstest, r(6, 320));
});

test('Bestleistungen werden gespeichert und wieder geladen', () => {
  const speicher = { daten: {}, getItem: (k) => speicher.daten[k] ?? null, setItem: (k, v) => (speicher.daten[k] = v) };
  let daten = trageLektionEin(leer(), 'finte', 3100).daten;
  daten = trageReaktionstestEin(daten, { paraden: 9, angriffe: 10, mittel: 280 }).daten;
  speichereTraining(daten, speicher);
  assert.deepEqual(ladeTraining(speicher), daten);
});

test('kaputte oder fehlende Daten führen nicht zum Absturz', () => {
  const mit = (wert) => ladeTraining({ getItem: () => wert });
  assert.deepEqual(mit(null), leer());
  assert.deepEqual(mit('{kaputt'), leer());
  assert.deepEqual(ladeTraining({ getItem: () => { throw new Error('gesperrt'); } }), leer());
  const teilweise = mit(JSON.stringify({ lektionen: { stoss: 2000, parade: -5, fleche: 'schnell', unbekannt: 3 }, reaktionstest: { paraden: 12, angriffe: 10, mittel: 3 } }));
  assert.deepEqual(teilweise, { lektionen: { stoss: 2000 }, reaktionstest: null });
  speichereTraining(leer(), { setItem: () => { throw new Error('voll'); } }); // darf nicht werfen
});

test('Zeiten stehen mit einer Nachkommastelle in der Sprache da', () => {
  assert.equal(sekunden(2345), '2,3 s');
  assert.equal(sekunden(999), '1,0 s');
});

test('im Reaktionstest greift der Trainer in unregelmäßigem Rhythmus an', () => {
  const trainer = new Trainer('reaktionstest', zufall(3));
  trainer.naechsterAngriff = 500;
  const { rot, gruen } = zweiFechter(180, undefined, trainer);
  const angriffe = [];
  for (let t = 0; t < 30_000; t += BILD) {
    trainer.denke(t, gruen, rot);
    gruen.aktualisiere(t, BILD, rot);
    rot.aktualisiere(t, BILD, gruen);
    if (gruen.aktion === 'stoss' && gruen.aktionStart === t) angriffe.push(t);
  }
  const abstaende = angriffe.slice(1).map((t, i) => t - angriffe[i]);
  assert.ok(abstaende.length >= 8, `nur ${angriffe.length} Angriffe`);
  assert.ok(Math.max(...abstaende) - Math.min(...abstaende) > 800, `Abstände ${abstaende}`);
});
