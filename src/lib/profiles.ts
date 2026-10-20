import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { HANDLE, RESERVED, type Profile } from './model';
import { THEMES, hasTheme } from '../themes';

export * from './model';

/**
 * Where profiles come from. Today: YAML files (single-user or self-hosted
 * mode). Later: a database behind registration — same shape.
 */
export interface ProfileStore {
  /** demo = no profiles/ yet, showing examples/; personal = exactly one profile */
  mode: 'demo' | 'personal' | 'directory';
  list(): Profile[];
  get(handle: string): Profile | undefined;
}

const readDir = (dir: string): Profile[] =>
  !fs.existsSync(dir)
    ? []
    : fs
        .readdirSync(dir)
        .filter((f) => /\.ya?ml$/.test(f))
        .map((f) => {
          const p = parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Profile;
          if (!p?.handle || !HANDLE.test(p.handle)) throw new Error(`${dir}/${f}: invalid or missing handle`);
          if (RESERVED.includes(p.handle)) throw new Error(`${dir}/${f}: handle "${p.handle}" is reserved`);
          if (!p.profile?.name) throw new Error(`${dir}/${f}: profile.name is required`);
          if (!hasTheme(p.theme)) throw new Error(`${dir}/${f}: unknown theme "${p.theme}" — available: ${THEMES.map((t) => t.id).join(', ')}`);
          return p;
        })
        .sort((a, b) => a.handle.localeCompare(b.handle));

// Files are re-read on every call so `astro dev` picks up new YAML without a restart.
export const yamlStore = (dir = path.resolve('profiles'), examples = path.resolve('examples')): ProfileStore => {
  const load = () => {
    const own = readDir(dir);
    return { own, list: own.length ? own : readDir(examples) };
  };
  return {
    get mode() {
      const n = readDir(dir).length;
      return n === 0 ? 'demo' : n === 1 ? 'personal' : 'directory';
    },
    list: () => load().list,
    get: (handle) => load().list.find((p) => p.handle === handle),
  };
};

export const store = yamlStore();
