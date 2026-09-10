import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    {
      name: 'copy-preload',
      closeBundle() {
        fs.copyFileSync(
          path.resolve(__dirname, 'electron/preload.cjs'),
          path.resolve(__dirname, 'dist-electron/preload.cjs')
        );
        if (fs.existsSync(path.resolve(__dirname, 'electron/logo.png'))) {
          fs.copyFileSync(
            path.resolve(__dirname, 'electron/logo.png'),
            path.resolve(__dirname, 'dist-electron/logo.png')
          );
        }
      },
    },
    renderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
