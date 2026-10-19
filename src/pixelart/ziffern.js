// Eigene Pixel-Ziffern 0–9 und Doppelpunkt. In Pixelify Sans sieht die 5 wie ein S und die 2 wie
// ein Z aus (Issue #8) – daher: 5 mit geradem, eckigem Kopf, 2 mit rundem Bogen.
// Raster wie die Ziffern von Pixelify Sans: 5 Bildpunkte breit, 7 hoch, von oben nach unten.
// werkzeuge/ziffern.mjs baut daraus die Schrift public/schrift/street-fencer-ziffern.ttf,
// die für Ziffern vor Pixelify Sans greift (siehe index.html) – so gilt sie für jede Zahl im Spiel.
export const ZIFFERN = {
  0: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  ':': ['.', '.', '.', '#', '.', '#', '.'],
};
