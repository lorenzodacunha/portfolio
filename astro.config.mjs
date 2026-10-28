// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static build published on Vercel (headers and cache in vercel.json). Content is the JSON in src/data.
export default defineConfig({
  site: 'https://lorenzodacunha.com.br',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
    // The whole stylesheet is a few dozen KB: inlined, the first paint needs no extra request.
    inlineStylesheets: 'always',
  },
  // pt-BR lives at the root, English at /en/ and Spanish at /es/ (spec 3.5); hreflang tags follow this list.
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  // Self-hosted at build: no request to Google Fonts from the visitor's browser.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      weights: [300, 400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Syncopate',
      cssVariable: '--font-syncopate',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Roboto Mono',
      cssVariable: '--font-roboto-mono',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
      display: 'swap',
    },
  ],
  vite: {
    build: {
      // Astro builds for esnext, and for esnext the CSS minifier (lightningcss) folds animation-timeline into the
      // animation shorthand, a form Chrome rejects: every scroll-driven animation was dropped from the build.
      // Real targets (Vite's own "baseline widely available" list) keep animation-timeline as its own property.
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
    },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'pt-br', locales: { 'pt-br': 'pt-BR', en: 'en', es: 'es' } },
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
