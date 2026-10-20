// Theme registry: every src/themes/<id>/theme.ts is picked up automatically.
import { fontsHref, themeRule, type ThemeDefinition } from './define';

const modules = import.meta.glob<{ default: ThemeDefinition }>('./*/theme.ts', { eager: true });

export const DEFAULT_THEME = 'acid';

export const THEMES: ThemeDefinition[] = Object.entries(modules)
  .map(([file, m]) => {
    const t = m.default;
    const folder = file.split('/')[1];
    if (t.id !== folder) throw new Error(`Theme in src/themes/${folder}/ has id "${t.id}" — it must match the folder name`);
    return t;
  })
  // built-in default first, then alphabetical
  .sort((a, b) => (a.id === DEFAULT_THEME ? -1 : b.id === DEFAULT_THEME ? 1 : a.name.localeCompare(b.name)));

export const getTheme = (id?: string) => THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;

export const hasTheme = (id?: string) => !id || THEMES.some((t) => t.id === id);

/** All theme token rules, for a <style> tag in the page head. */
export const themesCss = () => THEMES.map(themeRule).join('\n');

/** Fonts for the given theme ids, or for every theme when omitted. */
export const themeFontsHref = (ids?: (string | undefined)[]) =>
  fontsHref(ids ? [...new Set(ids.map((id) => getTheme(id)))] : THEMES);

export type { ThemeDefinition } from './define';
