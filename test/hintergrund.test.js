import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stummImHintergrund } from '../src/hintergrund.js';

// Nachgebautes Dokument und nachgebauter AudioContext
function aufbau() {
  const lauscher = {};
  const dokument = {
    hidden: false,
    addEventListener: (art, f) => (lauscher[art] = f),
    removeEventListener: (art) => delete lauscher[art],
  };
  const ctx = {
    state: 'running',
    suspend: async () => (ctx.state = 'suspended'),
    resume: async () => (ctx.state = 'running'),
  };
  const ereignis = async (art) => {
    lauscher[art]?.();
    await Promise.resolve();
  };
  return { dokument, ctx, lauscher, ereignis };
}

test('Im Hintergrund wird der Ton angehalten, im Vordergrund geht er weiter', async () => {
  const { dokument, ctx, ereignis } = aufbau();
  stummImHintergrund(ctx, dokument);

  dokument.hidden = true;
  await ereignis('visibilitychange');
  assert.equal(ctx.state, 'suspended');

  dokument.hidden = false;
  await ereignis('visibilitychange');
  assert.equal(ctx.state, 'running');
});

test('Lässt der Browser den Ton nicht gleich wieder an, hilft die nächste Berührung', async () => {
  const { dokument, ctx, ereignis } = aufbau();
  ctx.resume = async () => {}; // Browser verweigert das Fortsetzen ohne Berührung
  stummImHintergrund(ctx, dokument);
  dokument.hidden = true;
  await ereignis('visibilitychange');
  dokument.hidden = false;
  await ereignis('visibilitychange');
  assert.equal(ctx.state, 'suspended');

  ctx.resume = async () => (ctx.state = 'running');
  await ereignis('pointerdown');
  assert.equal(ctx.state, 'running');
});

test('Abmelden entfernt beide Lauscher', () => {
  const { dokument, ctx, lauscher } = aufbau();
  const abmelden = stummImHintergrund(ctx, dokument);
  abmelden();
  assert.deepEqual(Object.keys(lauscher), []);
});
