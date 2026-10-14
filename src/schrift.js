// Pixelschrift „Pixelify Sans“ (OFL-Lizenz, Datei in public/schrift/)
export const SCHRIFT = '"Pixelify Sans", sans-serif';

export const stil = (groesse, farbe = '#ffffff', extra = {}) => ({
  fontFamily: SCHRIFT,
  fontSize: `${groesse}px`,
  color: farbe,
  ...extra,
});

// Die Schrift muss geladen sein, bevor Phaser den ersten Text zeichnet
export function ladeSchrift() {
  return document.fonts.load(`16px ${SCHRIFT}`).catch(() => {});
}
