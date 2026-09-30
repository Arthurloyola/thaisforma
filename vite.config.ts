import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base relativo: o app funciona na raiz de um domínio ou em subpasta (ex.: GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: './',
        name: 'Thaís Maromba',
        short_name: 'Thaís Maromba',
        description: 'Os treinos da Thaís, organizados e sempre à mão.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#5A1F3A',
        theme_color: '#FBF6F6',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Todo o app (JS, CSS, fontes, ícones) fica em cache: a interface abre sem internet.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
});
