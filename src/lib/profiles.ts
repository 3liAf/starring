import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export type Visibility = 'public' | 'private' | 'nda';

export interface Profile {
  handle: string;
  theme?: 'acid' | 'blood' | 'ice';
  profile: {
    name: string;
    role: string;
    location?: string;
    tagline?: string;
    available?: boolean;
    links?: Record<string, string>;
  };
  contributions?: { year: number; public: number; private: number; verified?: boolean }[];
  platforms?: { name: string; kind: 'public' | 'private'; repos: number; commits: number }[];
  clients?: { name: string; sector?: string; nda?: boolean }[];
  experience?: {
    company: string;
    role: string;
    from: number;
    to: number | null;
    summary?: string;
    clients?: string[];
    stack?: string[];
  }[];
  projects?: {
    title: string;
    client?: string;
    year: number;
    visibility: Visibility;
    role?: string;
    blurb: string;
    impact?: string[];
    stack?: string[];
    url?: string;
  }[];
  education?: { school: string; degree: string; from: number; to: number }[];
  skills?: Record<string, string[]>;
}

/**
 * Where profiles come from. Today: YAML files in /profiles (single-user or
 * self-hosted mode). Later: a database behind registration — same shape.
 */
export interface ProfileStore {
  list(): Profile[];
  get(handle: string): Profile | undefined;
}

const HANDLE = /^[a-z0-9][a-z0-9-]{1,38}$/;

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

// ---------- derived numbers ----------

export const totals = (p: Profile) => {
  const c = p.contributions ?? [];
  const pub = c.reduce((s, y) => s + y.public, 0);
  const priv = c.reduce((s, y) => s + y.private, 0);
  const years = (p.experience ?? []).map((e) => e.from);
  const start = years.length ? Math.min(...years) : new Date().getFullYear();
  return {
    public: pub,
    private: priv,
    all: pub + priv,
    privateShare: pub + priv ? Math.round((priv / (pub + priv)) * 100) : 0,
    years: new Date().getFullYear() - start,
    clients: p.clients?.length ?? 0,
    repos: (p.platforms ?? []).reduce((s, x) => s + x.repos, 0),
  };
};

/**
 * Turn a yearly total into a 53x7 heatmap. Deterministic per (handle, year)
 * so builds are stable. Real importers will replace this with daily data.
 */
export const heatmap = (handle: string, year: number, total: number): number[] => {
  let seed = [...`${handle}${year}`].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const weights = Array.from({ length: 53 * 7 }, (_, i) => {
    const weekday = i % 7;
    const base = weekday === 0 || weekday === 6 ? 0.15 : 1;
    return rnd() < 0.12 ? 0 : base * rnd() ** 1.6;
  });
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const days = weights.map((w) => (w / sum) * total);
  const max = Math.max(...days) || 1;
  return days.map((d) => (d === 0 ? 0 : Math.min(4, Math.ceil((d / max) * 4))));
};
