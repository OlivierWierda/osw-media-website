## Project status (handoff note — read this first)

Read `osw-media-project-brief.md` for the full spec; this is just where things stand.

**Done** (brief's build sequence steps 1–6, i.e. the whole thing is live):
- Scaffold, landing page (real copy in `src/components/pages/HomeView.astro`),
  full visual design pass (brand colors/type/logo in `src/styles/global.css`,
  dark theme).
- `/albums` (grid) + `/albums/[slug]` (mixed photo/clip gallery, Photos/Video
  Clips filter pills, lightbox with prev/next + order button).
- `/portfolio` — a single standalone showcase gallery, not part of the
  albums collection. Site nav order is Portfolio / Albums / Contact.
- The gallery + filter + lightbox UI is one shared component,
  `src/components/MediaGallery.astro`, used by both `/portfolio` and
  `/albums/[slug]` — extend it there, don't duplicate it back out. It
  renders real photos/Stream clips when `src`/`streamId` are set, and
  falls back to a striped placeholder tile otherwise.
- Album content lives in `src/content/albums/*.json` (Astro content
  collection, schema in `src/content.config.ts`). Portfolio content is a
  plain JSON import (`src/content/portfolio.json`), not a collection, since
  there's only ever one.
- Step 5 (mailto/order-link wiring): done — every Contact and order button
  points at `hello@osw.media`.
- **Step 6 (deployment): done.** GitHub repo at
  github.com/OlivierWierda/osw-media-website, connected to Cloudflare
  Pages (classic Pages workflow, not the newer Workers-unified one — that
  one wants a `wrangler.toml` this static site doesn't have). `osw.media`
  registered at Porkbun, DNS moved to Cloudflare (via Porkbun's built-in
  "Connect to Cloudflare" one-click, not manual nameserver copy-paste),
  custom domain attached to the Pages project. Every push to `master`
  auto-deploys.
- **Email: done.** `hello@osw.media` receives mail via Cloudflare Email
  Routing (free), catch-all rule forwarding everything `@osw.media` to the
  owner's Gmail. No Google Workspace/paid mailbox — replies go out from
  Gmail as normal, this only handles receiving.
- **No-CLI content workflow: done.** Site owner never touches a terminal
  to add real photos:
  - `public/media/albums/<Album Name>/` — one folder per album, named
    exactly what should show as the on-site title. Drop watermarked
    photos in, plus an `info.txt` (`DATE:`, `VENUE:`, `EVENT:`,
    `ALT-TEXT:`, optional `SUMMARY:`).
  - `public/media/portfolio/` — same idea, one shared folder, `info.txt`
    just needs `ALT-TEXT:` (tagline is UI copy now, see i18n below).
  - Each folder gets a copy of `scripts/templates/Update Website.bat` (or
    `Update Portfolio.bat` for the portfolio one) — double-click it,
    no typing. It shells out to `scripts/sync-album-folder.mjs` /
    `sync-portfolio-folder.mjs`, which regenerate the content JSON from
    whatever's in the folder + `info.txt`, preserving any hand-added
    `alt`/`classes` on photos already listed. Safe to re-run any time.
  - `scripts/build-album-json.mjs` is the older CLI-flags version, kept
    for advanced/manual use; the `.bat` files are the real day-to-day path.
  - Video clips are NOT automated — they need a Cloudflare Stream upload
    (account not set up) to get a `streamId`; the sync scripts just warn
    if they spot stray video files sitting in a folder.
- **i18n: done.** English (default, `/`) + Dutch (`/nl/`), two flag-emoji
  buttons in the header, no auto-detection/redirect. All static UI copy —
  including the portfolio tagline — lives in `src/i18n/ui.ts` as a
  dotted-key dictionary read via `useTranslations()`. Album/portfolio
  content itself (titles, venues, summaries) is NOT translated — typed
  once via `info.txt`, same for both languages. Page markup is factored
  into `src/components/pages/*View.astro` (Home/Portfolio/AlbumsIndex/
  AlbumDetail) so both languages render from one source; `src/pages/` and
  `src/pages/nl/` are thin wrapper files.
- Real content in so far: ADAC Hansa Racing Day (TT Assen, 328 photos),
  2 real photos each on Silverstone GT Cup and the portfolio. The two
  Spa 24H placeholder-only albums were deliberately deleted (not real
  content yet, re-add via the folder workflow above when there's a real
  event).

**To do now: final passes + add final content.** No more infrastructure
work queued — remaining work is normal iteration (bug fixes, polish,
copy tweaks) plus the site owner filling in more real albums/photos via
the folder + double-click-`.bat` workflow above.

**Known open items:**
- No Cloudflare Stream account/videos wired up yet — every "clip" item is
  still a placeholder until that exists.
- Per-item `classes` (race-class tags, e.g. "GT3") are in the content
  schema already but there's no filter UI for them yet — deliberately
  deferred until there's a real multi-class event to test against.
- Dev server: `astro dev --background` picks whatever port is free (has
  drifted across restarts) — check the command's output for the actual
  port rather than assuming 4321.
- `brandkit/` (logos, color/type guidelines, fonts, plus a growing set of
  real event photos) is checked into the repo as source-of-truth; working
  copies actually used by the site live under `public/brand/`,
  `public/fonts/`, `src/assets/brand/`, and `public/media/`.
- i18n's `src/i18n/ui.ts` (dotted-key TypeScript dictionary) works fine
  today but gets janky as it grows — a plain-text copy file per language
  that `ui.ts` maps onto component keys would be easier to maintain
  long-term. Noted, not done.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
