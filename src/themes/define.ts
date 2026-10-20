// The theme contract. A theme is a folder in src/themes/<id>/ with a theme.ts
// that default-exports defineTheme({...}), plus an optional style.css for
// anything tokens can't express. See CONTRIBUTING.md → "Add a theme".

export interface ThemeTokens {
  /** page background */
  bg: string;
  /** main text */
  fg: string;
  /** secondary text */
  muted: string;
  /** borders, empty heatmap cells */
  line: string;
  /** the one loud colour: second name line, numbers, highlights */
  accent: string;
  /** text on top of the accent */
  accentInk: string;
  /** redaction bars on NDA projects */
  redact: string;
}

/** Google Fonts spec, e.g. 'Anton' or 'Space Grotesk:wght@400;500;700'. */
export type GoogleFont = string;

export interface ThemeDefinition {
  /** folder name, kebab-case; what profiles put in `theme:` */
  id: string;
  name: string;
  description: string;
  author: { name: string; url?: string };
  scheme: 'dark' | 'light';
  tokens: ThemeTokens;
  fonts: { display: GoogleFont; body: GoogleFont; mono: GoogleFont };
}

export const defineTheme = (t: ThemeDefinition): ThemeDefinition => t;

const FALLBACK = {
  display: "'Impact', 'Arial Narrow', sans-serif",
  body: 'system-ui, sans-serif',
  mono: 'ui-monospace, monospace',
};

export const family = (spec: GoogleFont) => spec.split(':')[0];

/** CSS custom properties for one theme, scoped to [data-theme="<id>"]. */
export const themeRule = (t: ThemeDefinition) => {
  const k = t.tokens;
  return `[data-theme="${t.id}"]{color-scheme:${t.scheme};--bg:${k.bg};--fg:${k.fg};--muted:${k.muted};--line:${k.line};--accent:${k.accent};--accent-ink:${k.accentInk};--redact:${k.redact};--display:'${family(t.fonts.display)}',${FALLBACK.display};--body:'${family(t.fonts.body)}',${FALLBACK.body};--mono:'${family(t.fonts.mono)}',${FALLBACK.mono}}`;
};

/** One Google Fonts stylesheet URL for a set of themes (deduplicated). */
export const fontsHref = (themes: ThemeDefinition[]) => {
  const specs = [...new Set(themes.flatMap((t) => [t.fonts.display, t.fonts.body, t.fonts.mono]))];
  const q = specs.map((s) => `family=${encodeURIComponent(s).replace(/%20/g, '+').replace(/%3A/gi, ':').replace(/%40/g, '@').replace(/%3B/gi, ';').replace(/%2C/gi, ',')}`).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
};
