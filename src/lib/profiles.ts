import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { HANDLE, type Profile } from './model';

export * from './model';

/**
 * Where profiles come from. Today: YAML files in /profiles (single-user or
 * self-hosted mode). Later: a database behind registration — same shape.
 */
export interface ProfileStore {
  list(): Profile[];
  get(handle: string): Profile | undefined;
}

export const yamlStore = (dir = path.resolve('profiles')): ProfileStore => {
  const load = (): Profile[] =>
    fs
      .readdirSync(dir)
      .filter((f) => /\.ya?ml$/.test(f))
      .map((f) => {
        const p = parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Profile;
        if (!p?.handle || !HANDLE.test(p.handle)) throw new Error(`${f}: invalid or missing handle`);
        if (!p.profile?.name) throw new Error(`${f}: profile.name is required`);
        return p;
      })
      .sort((a, b) => a.handle.localeCompare(b.handle));
  return {
    list: load,
    get: (handle) => load().find((p) => p.handle === handle),
  };
};

export const store = yamlStore();
