import { defineConfig } from 'tsup';

export default defineConfig([
  // =========================
  // ESM build (modern apps)
  // =========================
  {
    entry: ['src/index.js'],
    format: ['esm'],
    outDir: 'dist',
    fileName: () => 'notifyit.esm.js',
    clean: false,
    minify: false,
    sourcemap: true,
  },

  // =========================
  // IIFE build (CDN / script tag)
  // =========================
  {
    entry: ['src/index.js'],
    format: ['iife'],
    globalName: 'NotifyIt',
    outDir: 'dist',
    fileName: () => 'notifyit.js',
    clean: false,
    minify: true,
    sourcemap: false,
  }
]);