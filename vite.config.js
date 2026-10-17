import { defineConfig } from 'vite';

// Relative Pfade („./“), damit derselbe Build überall läuft: im Browser unter
// https://valleralle.github.io/Street-Fencer/, in der Android-App (Capacitor) und in der .exe.
export default defineConfig({
  base: './',
});
