import { defineConfig } from 'astro/config';
import remarkHandbook from './src/lib/remark-handbook.mjs';

export default defineConfig({
  // Set this to your real domain when you deploy (used for canonical URLs).
  site: 'https://learnwithridwan.com',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkHandbook],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
});
