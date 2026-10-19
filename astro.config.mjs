import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

export default defineConfig({
  // Set `site` (and `base` for project pages) when deploying to GitHub Pages.
  site: 'https://example.github.io',

  integrations: [react()],
});