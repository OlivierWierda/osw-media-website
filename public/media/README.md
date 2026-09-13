# Media folder

Real photos/clips for the site live here, under `public/`, so they're served
as static files at a predictable URL path — that's what the `src` field in
the content JSON should point to.

## Structure

```
public/media/
  portfolio/                  <- images for src/content/portfolio.json
  albums/
    <album-slug>/              <- one folder per src/content/albums/<slug>.json
```

Album folder names match the JSON filename (without `.json`) exactly, e.g.
`albums/silverstone-gt-cup/` holds the photos/clip-posters referenced by
`src/content/albums/silverstone-gt-cup.json`.

## Wiring a file in

1. Drop the exported/watermarked photo into the right folder, e.g.
   `public/media/albums/silverstone-gt-cup/porsche-911-rear.jpg`.
2. In the matching content JSON, set that item's `src` to the root-relative
   path: `"src": "/media/albums/silverstone-gt-cup/porsche-911-rear.jpg"`.
3. Video clips: `streamId` is a Cloudflare Stream video UID, not a file in
   this folder — clips get uploaded to Cloudflare Stream separately, once
   that account exists (not set up yet, see CLAUDE.md).

## Not done yet

`MediaGallery.astro` currently always renders the striped placeholder tile,
even when `src`/`streamId` is filled in — the code path that actually draws
the real photo/video hasn't been added. Filling in `src` alone won't change
what renders on the site until that's wired up.

## Naming

Keep filenames descriptive and web-safe (lowercase, hyphens, no spaces) —
e.g. `porsche-911-gt3-corner-3.jpg`, not `IMG_4821.JPG`. Large source
exports/raws stay in `brandkit/brand art/`; only the final web-sized,
watermarked export goes here.
