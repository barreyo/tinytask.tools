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
    build: {
      // Inline small assets to reduce requests
      assetsInlineLimit: 4096,
    },
  },
});
