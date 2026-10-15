import Phaser from 'phaser';

// Eine Steuerung sagt einem Fechter, welche Tasten gehalten werden und welche gerade gedrückt wurden.
// Namen: links, rechts, stoss, parade, tiefstoss. Der Computergegner bietet dieselben zwei Methoden.
export function tastaturSteuerung(szene, belegung) {
  const tasten = szene.input.keyboard.addKeys(belegung);
  return {
    gehalten: (name) => tasten[name].isDown,
    gedrueckt: (name) => Phaser.Input.Keyboard.JustDown(tasten[name]),
  };
}
