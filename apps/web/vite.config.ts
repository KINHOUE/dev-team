import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Le design system est consommé en source TypeScript (package local lié via file:).
// On laisse Vite transpiler ses fichiers à la volée plutôt que de les pré-bundler,
// et on dédoublonne React pour éviter deux instances (hooks invalides).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Mon Budget — Finances & Tâches',
        short_name: 'Mon Budget',
        description:
          'Suivez vos dépenses, budgets et prévisions, et gérez vos tâches. Saisie vocale incluse.',
        lang: 'fr',
        theme_color: '#6366f1',
        background_color: '#0b0b12',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // L'app shell est mise en cache ; les appels API (cross-origin) ne le sont jamais.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['@dev-team/design-system'],
  },
  server: {
    port: 5173,
    fs: {
      // Autorise la lecture du design system, situé hors de apps/web.
      allow: ['../..'],
    },
  },
});
