// Spieler-Attrappe für Balance-Messungen: läuft vor, bis der Gegner höchstens maxAbstand entfernt ist,
// und setzt dann – sobald sein Fechter frei ist – immer dieselbe Aktion ein (Issue #10)
export function spammer(aktion, maxAbstand) {
  let druecken = false;
  let vor = false;
  return {
    denke: (t, ich, gegner) => {
      const abstand = Math.abs(gegner.x - ich.x);
      const frei = !ich.aktion && !ich.offen;
      druecken = frei && abstand <= maxAbstand;
      vor = frei && abstand > maxAbstand;
    },
    gehalten: (t) => t === 'rechts' && vor,
    gedrueckt: (t) => t === aktion && druecken,
  };
}
