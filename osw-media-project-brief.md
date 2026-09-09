# osw.media — Project Brief (Phase 1: Photo/Video)

## Context

osw.media is the future home for three separate but related brands run by one person:

1. **OSW's Photo Video** — racecar media production. Started as track photography, has grown into spec work and now accreditation. This is the active gig and the priority for this build.
2. **OSW-Academy** — sim racing coaching. Free course videos + paid 1-on-1 coaching bookings. Planned for a later phase.
3. **OSW-Sim-Sports** — YouTube channel / personal brand. Lowest priority, planned for a later phase.

**This brief covers Phase 1 only: the Photo/Video section.** Academy and Sim-Sports are out of scope for this build but the architecture should not preclude adding them later.

## Root domain behavior (Phase 1)

`osw.media` root points directly to the Photo/Video landing page. There is **no** three-way chooser yet — that gets added once Academy and Sim-Sports sections exist. Do not build placeholder/"coming soon" pages for those sections in this phase.

## Hard constraints

- **No WordPress.**
- **No React / heavy frontend framework complexity** — plain HTML/CSS preferred, JS only where genuinely needed.
- **No checkout / product catalog.** Media is not sold as individual listed products. Ordering unwatermarked/4K media happens via direct email inquiry, not automated payment.
- **No dynamic watermarking.** All watermarked images/clips are pre-exported by the site owner before upload — the site only displays already-watermarked static files.
- Aesthetic: **functional and trustworthy**, not flashy. This is a professional accreditation-holding media business — the site should read as credible to race teams/organizers, not like a hobby portfolio.

## Tech stack (decided)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro** | Static site generator, islands architecture, zero JS by default, file-based routing |
| Hosting | **Cloudflare Pages** | Free tier, auto-deploy on git push, same account as Stream + DNS |
| Video hosting | **Cloudflare Stream** | For watermarked video clips. ~$5–15/mo at this scale. No YouTube branding. |
| Images | **Static assets in-repo** | Astro's built-in image optimization (resizing, lazy-load, modern formats). Revisit with Cloudflare Images if the library grows very large. |
| Contact / ordering | **`mailto:` links** | No form backend. Order links pre-fill the email subject with the album name for easy reference. |
| Booking (Academy, later) | Calendly | Not needed in Phase 1 |
| Domain/DNS | Cloudflare DNS | Same account as Pages/Stream |
| Version control | Git + GitHub | Triggers Cloudflare Pages auto-deploy |

## Site structure (Phase 1)

```
/                      → Photo/Video landing page
/albums                → Grid of albums
/albums/[slug]         → Individual album: mixed photos + video clips, filterable, "order full quality photos/clips" mailto link
```

An album is per event, or — for a multi-day event — per day (e.g. "Spa 24H — Day 1", "Spa 24H — Day 2" as separate album entries; no event-grouping layer above albums).

### `/` — Landing page
- Hero / intro
- Short "about me" blurb (accreditation, background, what kind of work is done)
- "Get in touch" button → simple `mailto:` link
- Link/button to Albums

### `/albums`
- Grid layout, one entry per album (event or event-day)
- Each entry links to its own detail page (`/albums/[slug]`)

### `/albums/[slug]`
- Single gallery combining pre-watermarked images and watermarked video clips (Cloudflare Stream embeds) for that album
- Two prominent filter buttons: **Photos** / **Video Clips** (plus an implicit "All"), filtering the same gallery client-side
- One "Order full quality photos/clips" button per album → `mailto:` link, subject line pre-filled with the album name (e.g. `mailto:hello@osw.media?subject=Order%20inquiry:%20[Album%20Name]`) — buyer specifies which items they want in the email body

## Content/assets

- All images and video clips supplied are **already watermarked** — no watermarking logic needed in the site.
- Video files are uploaded to Cloudflare Stream separately (not part of the Astro repo); album pages embed clips via Stream's player, interleaved with photos in the same gallery.
- Images live as static files in the Astro project (`src/assets` or `public`, per Astro convention) — actual files to be supplied by the site owner per album.
- Album data (name, slug, ordered list of photo + clip items) lives in structured content files (Astro content collection) — not hardcoded in page templates — so new albums/items can be added without touching code.

## Build sequence (agreed)

Each step should produce the full current state of the site, not an isolated fragment, so it can be reviewed and run at every stage.

1. **Project scaffold** — Astro project structure, empty routes for all 3 pages listed above, base layout (nav/footer), no styling yet. Should run (`astro dev`) with no errors.
2. **Landing page content structure** — hero, about, get-in-touch, section link. Plain markup, no visual design yet.
3. **Visual design pass** — typography, color, layout for the trustworthy/professional aesthetic, applied to the landing page first.
4. **Albums** — grid page + individual album template (mixed photo/clip gallery with Photos/Video Clips filter, Cloudflare Stream embed placeholders), styled to match, with placeholder media until real assets are supplied.
5. **Mailto/order-link wiring** — get-in-touch and order links across all pages, final content pass.
6. **Deployment** — Cloudflare Pages setup, custom domain (`osw.media`) connection.

## Explicitly out of scope for this phase

- Academy section (about, free course videos, 1-on-1 booking)
- Sim-Sports / YouTube section
- Three-way landing chooser
- Any payment/checkout integration
- Dynamic watermarking
- Contact form (mailto only, for now)
