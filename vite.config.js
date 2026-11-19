import { cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

function copyAssetsPlugin() {
  return {
    name: 'copy-assets',
    apply: 'build',
    async closeBundle() {
      await cp(resolve(root, 'assets'), resolve(root, 'dist', 'assets'), {
        recursive: true,
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), copyAssetsPlugin()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        privacidade: resolve(root, 'privacidade.html'),
      },
    },
  },
});
