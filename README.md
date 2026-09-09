# osw.media — Phase 1 (Photo/Video)

Astro site for OSW's Photo Video. See `osw-media-project-brief.md` for full project scope, constraints, and build sequence.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build production site to `./dist/`            |
| `npm run preview`   | Preview the production build locally          |

## Structure

```
src/
├── layouts/
│   └── Layout.astro       # base layout: nav + footer
└── pages/
    ├── index.astro         # landing page
    ├── albums/
    │   ├── index.astro     # albums grid
    │   └── [slug].astro    # individual album
    └── clips/
        ├── index.astro     # clips grid
        └── [slug].astro    # individual clip
```
