import { defineConfig } from 'astro/config';
import remarkHandbook from './src/lib/remark-handbook.mjs';

export default defineConfig({
  // Set this to your real domain when you deploy (used for canonical URLs).
  site: 'https://engineeringpath.vercel.app',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkHandbook],
    // Keep "--" as typed: it appears in URLs and code, where an em dash would be wrong.
    smartypants: { dashes: false },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
});
