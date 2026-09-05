import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  build: { outDir: 'dist-node' },
  server: {
    host: '127.0.0.1',
    fs: {
      deny: [
        '.env',
        '.env.*',
        '**/.git/**',
        '**/.dev.vars',
        '**/.credentials.txt',
        '**/data/**',
        '**/*.sqlite*',
        '**/*.{crt,pem}',
      ],
    },
  },
});
