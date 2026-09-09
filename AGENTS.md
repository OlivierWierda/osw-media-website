## Project status (handoff note — read this first)

Read `osw-media-project-brief.md` for the full spec; this is just where things stand.

**Done** (brief's build sequence steps 1–4, plus extras):
- Scaffold, landing page (real copy in `src/pages/index.astro`), full visual
  design pass (brand colors/type/logo in `src/styles/global.css`, dark theme).
- `/albums` (grid) + `/albums/[slug]` (mixed photo/clip gallery, Photos/Video
  Clips filter pills, lightbox with prev/next + order button).
- `/portfolio` — a single standalone showcase gallery, not part of the
  albums collection, added after the original brief was written. Site nav
  order is Portfolio / Albums / Contact.
- The gallery + filter + lightbox UI is one shared component,
  `src/components/MediaGallery.astro`, used by both `/portfolio` and
  `/albums/[slug]` — extend it there, don't duplicate it back out.
- Album content lives in `src/content/albums/*.json` (Astro content
  collection, schema in `src/content.config.ts`). Portfolio content is a
  plain JSON import (`src/content/portfolio.json`), not a collection, since
  there's only ever one. Every item currently has no `src`/`streamId`, so it
  renders as a striped placeholder tile — that's intentional until real
  photos/Stream video IDs are supplied.
- Step 5 (mailto/order-link wiring) is effectively done — every Contact and
  order button already points at `hello@osw.media`.

**Not done — step 6, deployment**, and it needs the site owner, not just
Claude: a GitHub repo to push this to (none exists yet, `git remote -v` is
empty), then connecting that repo to Cloudflare Pages and pointing
`osw.media`'s DNS at it, in their Cloudflare dashboard.

**Known open items:**
- Confirm `hello@osw.media` is actually a live, checked inbox before this
  goes any further — every contact/order flow depends on it.
- Real photos/clips still need to replace the placeholder tiles.
- No Cloudflare Stream account/videos wired up yet.
- Per-item `classes` (race-class tags, e.g. "GT3") are in the content
  schema already but there's no filter UI for them yet — deliberately
  deferred until there's a real multi-class event to test against.
- Dev server: `astro dev --background` picks whatever port is free (has
  drifted 4321→4325 across restarts this session) — check the command's
  output for the actual port rather than assuming 4321.
- `brandkit/` (logos, color/type guidelines, fonts) is checked into the repo
  as source-of-truth; working copies actually used by the site live under
  `public/brand/`, `public/fonts/`, and `src/assets/brand/`.

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
