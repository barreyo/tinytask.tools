// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Required for sitemap generation and canonical URLs — update before deploy
  site: 'https://tinytask.tools',

  integrations: [sitemap()],

  // Compress HTML output in production
  compressHTML: true,

  // Enable prefetching for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Pre-bundle heavy deps so Vite doesn't compile them on the first page hit
      // (which would cause e2e test timeouts when the module cache is cold).
      include: ['gifenc', 'papaparse', 'qr-code-styling'],
    },
    build: {
      // Inline small assets to reduce requests
      assetsInlineLimit: 4096,
    },
  },
});
