// Im Hintergrund (App verlassen, Tab gewechselt, Bildschirm aus) ist das Spiel stumm.
// Phaser schaltet den Ton nur ab, wenn das Fenster den Fokus verliert („blur“) – in der
// Android-App kommt beim Wechsel in den Hintergrund aber nur „visibilitychange“.
// Ein angehaltener AudioContext hält auch die Uhr der Musik an (musik.js plant nach
// ctx.currentTime), es stauen sich also keine Noten auf.
export function stummImHintergrund(ctx, dokument = globalThis.document) {
  // Manche Browser (iPhone) lassen den Ton erst nach einer Berührung wieder an
  const beiBeruehrung = () => {
    if (!dokument.hidden && ctx.state !== 'running') ctx.resume().catch(() => {});
  };
  const aendern = () => {
    if (dokument.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  };
  dokument.addEventListener('visibilitychange', aendern);
  dokument.addEventListener('pointerdown', beiBeruehrung);
  return () => {
    dokument.removeEventListener('visibilitychange', aendern);
    dokument.removeEventListener('pointerdown', beiBeruehrung);
  };
}
