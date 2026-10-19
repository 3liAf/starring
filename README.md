# Showtime

Your developer career as a scroll story, including the work GitHub can't show.

Most of a working developer's code lives in private repos: client work, agency GitLab, work under NDA. Showtime puts it on one page next to your public repos, your school and your stack, and the page is designed to stick in people's heads.

> Status: v0.1 prototype. Static Astro site, profiles in YAML, a visual editor, and an instant draft from your GitHub profile.

## Your own Showtime site in 5 minutes

1. Click **[Use this template](https://github.com/pipozzz/showtime/generate)** to create your own repo.
2. Open the editor (`npm run dev`, then `/edit`). Type your GitHub username to get an instant draft, then add the parts GitHub can't see: clients, NDA projects, your timeline, school.
3. Press **Export .yaml** and save the file as `profiles/<your-handle>.yaml` in your repo. With exactly one file in `profiles/`, your profile becomes the home page.
4. In your repo, open **Settings → Pages → Build and deployment** and set **Source: GitHub Actions**.
5. Push to `main`. The workflow in `.github/workflows/pages.yml` builds the site and publishes it at `https://<user>.github.io/<repo>/`. Name the repo `<user>.github.io` to serve it from the root.

The workflow reads the correct `site` and `base` from GitHub Pages, so project pages, user pages and custom domains all work without editing config.

## Run it locally

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # static output in dist/
```

## A profile is one YAML file

Each file in `profiles/` becomes a page at `/<handle>`. You can copy `examples/nova.yaml` as a starting point, or export one from the editor.

| `profiles/` contains | Home page shows |
| --- | --- |
| nothing | demo: the samples from `examples/` |
| one file | that profile, so the repo works as a personal site |
| several files | a directory of all profiles |

| Section | What it shows |
| --- | --- |
| `profile` | Name, role, tagline, links, "available for work" flag |
| `contributions` | Public and private commits per year; `verified: true` means the counts came from an importer |
| `platforms` | GitHub, GitLab (also self-hosted), Bitbucket: repo and commit totals |
| `clients` | Client wall; `nda: true` marks client names you're allowed to say but whose work you can't show |
| `experience` | Timeline of roles, linked to clients and stack |
| `projects` | Featured work with `visibility: public \| private \| nda`; NDA projects get redacted bars instead of links |
| `education`, `skills` | CV section |

Themes: `acid`, `blood`, `ice`.

## Visual editor

You can build a profile without touching YAML at `/edit`. Start from `/edit?new` for a blank profile, or from `/edit?from=nova` to begin with an existing one.

- The live preview uses the same `ProfileStory` component as the published page, so the preview matches what ships. You can preview it at desktop, tablet or phone width; the layout uses container queries, so the phone view really reflows.
- Click a section in the preview to jump to its form. Picking a section in the sidebar scrolls the preview to it.
- Cards can be reordered by dragging or with ↑/↓ buttons, duplicated, or deleted (deleting shows an undo toast). Tags (stack, impact, clients) suggest the clients you've already added.
- Validation runs as you type, with a badge per section. A "Stage ready" score lists what's still missing.
- Undo and redo use ⌘Z / ⇧⌘Z, and typing is merged into one undo step. Drafts autosave in the browser.
- To import, paste YAML, pick a file, or drop a `.yaml` file anywhere on the editor. To export, press ⌘S, which downloads `<handle>.yaml` for `profiles/`.

Today the editor runs entirely in the browser. When registration lands, autosave will go to the database instead of `localStorage`.

## Architecture: one person or many

The page code only uses the `ProfileStore` interface in `src/lib/profiles.ts`, so it doesn't care where a profile is stored.

```
            ┌──────────────┐
YAML files ─┤              │
            │ ProfileStore │──► /[handle] scroll story
Postgres  ──┤  list / get  │──► / landing + directory
(later)     └──────────────┘
```

Two ways to run it, from one codebase:

1. **Self-hosted, single user** (works today). Fork it, write one YAML file, deploy the static build to GitHub Pages, Netlify or Cloudflare.
2. **Hosted, multi-user** (roadmap). People register, claim a handle and edit their profile in the browser.

### Roadmap for multi-user

- Astro in hybrid mode: profile pages are pre-rendered or cached, the editor and API render on the server.
- Sign in with GitHub or GitLab OAuth (including self-hosted GitLab). The same token powers the public-repo importer. Candidate auth library: Better Auth.
- Postgres tables: `users`, `profiles` (a JSONB document validated against the same schema as the YAML), `handles` (unique, with a reserved-word list), `imports`.
- YAML import and export, so a self-hosted profile can move to the hosted service and back.
- Profile editor with a live preview.
- Moderation: reports, rate limits on handle claims, and checks that block impersonation of company names.

### Importers

- **GitHub (works today):** enter a username on the home page or in the editor (*Start from → GitHub profile*). The importer reads your public profile and repos in the browser, then fills in name, links, location, "available for work", your top 4 repos as featured projects (stars and forks become impact numbers), and your languages and topics as skills.
  - With an optional token that has the `read:user` scope, it also imports exact contributions per year, including the private count GitHub reports when "Include private contributions" is turned on. The token is used only for those requests and is never stored.
  - *Merge into current* refreshes the GitHub data and keeps your clients, timeline and NDA work.
  - Code: `src/lib/importers/github.ts`, browser and Node 18+.
- **GitLab and self-hosted GitLab (planned):** same pattern, with an instance URL.
- **Private (local CLI):** `npx showtime scan ~/work --email you@company.com` reads `git log` on your own machine and uploads only daily counts and dates. Code, messages and repo names stay on your machine unless you opt in.
- **Proof (idea):** a signed digest of commit hashes, so a former employer could confirm "these commits exist" without revealing them.

## A note on client names

Saying you worked on a project for a company is usually fine. Using its logo or describing the internals can break an NDA or trademark rules. Showtime displays client names as text by default, and the `nda` flag hides links and details. Check your contracts.

## License

MIT
