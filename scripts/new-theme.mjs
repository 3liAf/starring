#!/usr/bin/env node
// Scaffold a theme: npm run new:theme -- <id> ["Display Name"]
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [id, name] = process.argv.slice(2);
if (!id || !/^[a-z][a-z0-9-]{1,30}$/.test(id)) {
  console.error('Usage: npm run new:theme -- <id> ["Display Name"]\n  <id>: lowercase letters, digits, dashes (e.g. "noir" or "synth-wave")');
  process.exit(1);
}
const dir = join('src', 'themes', id);
if (existsSync(dir)) {
  console.error(`src/themes/${id} already exists — pick another id.`);
  process.exit(1);
}
const title = name || id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
let author = 'Your Name';
try { author = execSync('git config user.name', { encoding: 'utf8' }).trim() || author; } catch {}

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'theme.ts'), `import { defineTheme } from '../define';
import './style.css';

export default defineTheme({
  id: '${id}',
  name: '${title}',
  description: 'One line that sells the mood.',
  author: { name: '${author}', url: 'https://github.com/your-handle' },
  scheme: 'dark', // or 'light'
  tokens: {
    bg: '#0a0a0a', // page background
    fg: '#f2f0e9', // main text
    muted: '#8a877e', // secondary text
    line: '#2a2926', // borders, empty heatmap cells
    accent: '#d4ff00', // the one loud colour
    accentInk: '#0a0a0a', // text on top of the accent
    redact: '#f2f0e9', // NDA redaction bars
  },
  // Any Google Fonts family, optionally with axes: 'Inter:wght@400;700'
  fonts: { display: 'Anton', body: 'Space Grotesk:wght@400;500;700', mono: 'JetBrains Mono:wght@400;600' },
});
`);
writeFileSync(join(dir, 'style.css'), `/* ${title} — optional extras. Scope EVERY selector to [data-theme='${id}']. */

/* Example: softer display type
[data-theme='${id}'] .display { text-transform: none; letter-spacing: -0.02em; }
*/

/* Useful hooks: .hero, .hero-name .line.accent, .stat b, .marquee-track,
   .project, .project.vis-nda, .redacted span, .impact li, .heat .l1–.l4, .credits h2 */
`);
console.log(`Created src/themes/${id}/

Next:
  1. npm run dev
  2. Open http://localhost:4321/themes  — your theme is already in the gallery
  3. Tweak tokens in src/themes/${id}/theme.ts, extras in style.css
  4. Check desktop + phone in the editor, then open a PR with a screenshot`);
