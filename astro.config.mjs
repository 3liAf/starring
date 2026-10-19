import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// GitHub Pages sets these in .github/workflows/pages.yml:
//   SITE_URL  = https://<user>.github.io        (or your custom domain)
//   BASE_PATH = /<repo>   for project pages,  /  for <user>.github.io or a custom domain
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  integrations: [react()],
});
