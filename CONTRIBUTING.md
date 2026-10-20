# Contributing to Showtime

Thanks for taking a look. Showtime aims to be the place developers show their whole career, so contributions that help more people tell their story are the most welcome.

## Setup

```bash
git clone https://github.com/pipozzz/showtime.git
cd showtime
npm install
npm run dev        # http://localhost:4321, editor at /edit
```

Requires Node 22.22 or newer. There's no database and no environment variables. Sample profiles live in `examples/`.

Before opening a PR, run:

```bash
npm run build                      # must pass
BASE_PATH=/showtime npm run build  # must pass too: catches hard-coded "/" links
```

CI runs both.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/model.ts` | The `Profile` type, validation and derived numbers. It's browser-safe and shared by everything. |
| `src/lib/profiles.ts` | `ProfileStore`, which reads YAML from `profiles/` (falling back to `examples/`). |
| `src/lib/importers/` | Importers. Each one turns an external source into a `Profile`. |
| `src/story/` | `ProfileStory`, the scroll story. It's used by both the static pages and the editor preview. |
| `src/themes/` | Themes, one folder each, plus the registry (`index.ts`) and the contract (`define.ts`). |
| `src/editor/` | The visual editor (React, client-only). |
| `src/pages/` | Astro routes: `/`, `/[handle]`, `/edit`, `/themes`. |

## Ground rules

- **The story renders statically.** `ProfileStory` must not need client JS to show content. Animations are progressive enhancement.
- **Use container units in the story.** Use `cqi` and `@container`, not `vw` and `@media`, so the editor's phone preview stays truthful.
- **Build internal links with `link()`** from `src/lib/url.ts`, never as a literal `"/..."`.
- **Privacy first.** Importers send data only to the source they import from. Nothing about a user's private repos (code, messages, repo names) is ever sent anywhere unless the user explicitly opts in.
- **Never use client logos or brand assets** in examples. Use fictional company names.
- **Keep the schema backwards compatible.** New profile fields must be optional, so existing YAML keeps working.

## Good first contributions

### Add an importer

Create `src/lib/importers/<source>.ts` and export an async function that returns `{ profile, notes }`, following the pattern in `github.ts`:

- Accept an optional `base` profile and merge into it. Don't wipe clients, the timeline or NDA projects.
- Throw an `Error` with a message a person can act on, such as "rate limit hit — add a token".
- Return `notes` that tell the user what to fill in next.

Then add it to the editor's *Start from* menu.

### Add a theme

This is the easiest way to contribute, and every theme shows up in the [gallery](https://pipozzz.github.io/showtime/themes) with your name on it.

```bash
npm run new:theme -- noir "Film Noir"
npm run dev   # open /themes and /edit?from=nova&theme=noir
```

That creates `src/themes/noir/` with two files:

- **`theme.ts`**: `defineTheme({ id, name, description, author, scheme, tokens, fonts })`.
  - `tokens` are 7 colours: `bg`, `fg`, `muted`, `line`, `accent`, `accentInk`, `redact`.
  - `fonts` are Google Fonts families for `display`, `body` and `mono`.
  - It's picked up automatically, with no registry to edit.
- **`style.css`** (optional): anything the tokens can't express, such as scanlines, glow, marquee bulbs or italic serifs. Scope every selector to `[data-theme='noir']`. See `vhs/`, `broadway/` and `paper/` for examples.

**Checklist for a theme PR:**
- Text is readable: `fg` on `bg` and `accentInk` on `accent` pass WCAG AA (4.5:1).
- It looks right at phone width. Use the editor's phone preview.
- NDA redaction bars (`redact`) are visible on `bg`.
- Motion respects `prefers-reduced-motion`.
- The PR includes a screenshot of the hero and of one act.

## Commits and PRs

- Write small, focused PRs with a short description of *why*.
- For any visual change, include a screenshot or a short clip, desktop and phone if relevant.
- Commit messages should be in the imperative ("Add GitLab importer").

## Reporting bugs

Please include the profile YAML that renders wrong (fictional data is fine), the browser, and a screenshot.
