// Die Farbe jedes Fechters – gleich an Schuhen, Handschuh, Punktestand und Texten.
// Bewusst gedämpft, damit sie zur dunklen Halle passt.
export const FECHTERFARBEN = { rot: '#b5524a', gruen: '#55975f' };

// Eingeschaltete Lampen im Meldegerät leuchten etwas heller, ausgeschaltete sind fast dunkel
export const LAMPE_AN = { rot: 0xd2615a, gruen: 0x66b372 };
export const LAMPE_AUS = { rot: 0x3f2624, gruen: 0x23382a };

// Für Grafiken, die eine Zahl statt eines Textes brauchen
export const alsZahl = (hex) => parseInt(hex.slice(1), 16);
