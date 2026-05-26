# cbgabler-portfolio

Personal portfolio site for Carson Gabler, built with [Astro](https://astro.build),
Tailwind v4, and TypeScript. Designed for an academic audience (graduate-school
admissions and faculty) plus US recruiters.

Live: <https://cbgabler.pages.dev>

## Stack

- **Astro 5** — static-site build, zero client JS by default.
- **Tailwind 4** — design tokens (`@theme {}`) live in `src/styles/globals.css`.
- **MDX** — long-form project case studies in `src/content/projects/`, schema-validated.
- **Self-hosted variable fonts** — Fraunces (display serif) + Inter (sans) via
  `@fontsource-variable/*`, no Google Fonts dependency.
- **`astro-icon` + `lucide`** — tree-shaken icons, no client JS.
- **`@astrojs/sitemap`** — generates `sitemap-index.xml` at build time.

The previous React/Vite terminal-themed version is preserved at the git tag
`v0.1-terminal`. Check it out with `git checkout v0.1-terminal`.

## Local development

```bash
npm install
npm run dev        # serves at http://localhost:4321
```

Other scripts:

```bash
npm run build      # astro check + astro build → dist/
npm run preview    # serve the production build locally
```

If you're working without network access, set `ASTRO_TELEMETRY_DISABLED=1` to
suppress Astro's outbound telemetry write to `~/Library/Preferences`.

## Editing content

| What to change                                  | Where                                                 |
| ----------------------------------------------- | ----------------------------------------------------- |
| Name, tagline, status line, social links        | `src/data/site.ts`                                    |
| About paragraphs                                | `src/data/site.ts` → `SITE.about`                     |
| Experience entries                              | `src/data/site.ts` → `SITE.experience`                |
| Education entries                               | `src/data/site.ts` → `SITE.education`                 |
| Resume / CV PDF (the file `/cv` redirects to)   | `public/Carson_Gabler_Resume.pdf` + `SITE.cv` in `site.ts` |
| Site URL (canonical, OG tags, sitemap)          | `src/data/site.ts` → `SITE.url` + `astro.config.mjs`  |
| Nav labels                                      | `src/data/site.ts` → `NAV_LINKS`                      |
| Palette / fonts                                 | `src/styles/globals.css` → `@theme` block             |

### Adding a project case study

Drop a new `.mdx` file in `src/content/projects/`:

```mdx
---
title: "Project Name"
tagline: "One-line summary."
awards: "1st place — Some Event"   # optional
date: "May 2026"
tech: ["TypeScript", "Postgres"]
repoUrl: "https://github.com/cbgabler/project"
liveUrl: "https://demo.example.com"  # optional
order: 3                              # smaller = earlier on homepage
featured: false                       # true = headline card
hero: "../../assets/projects/<slug>/hero.png"  # optional
heroAlt: "Description of hero image"
---

import { Image } from "astro:assets";

## Section heading

Body text, markdown, MDX components, etc.
```

The schema in `src/content/config.ts` will reject the build if frontmatter is
missing required fields, so you won't accidentally ship a half-finished page.

Images that should be optimized go in `src/assets/projects/<slug>/` (Astro can
only transform images that live inside `src/`). Static assets (PDFs, etc.)
go in `public/`.

## Deploying to Cloudflare Pages

Cloudflare's edge has strong POPs in Tokyo, Seoul, Hong Kong, and Singapore —
the audience this site targets. Steps:

1. **Push the repo to GitHub** (you've already done this).
2. In the Cloudflare dashboard: **Pages → Create a project → Connect to Git**.
3. Pick the `cbgabler-portfolio` repo and the `main` branch.
4. Build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variable**: `ASTRO_TELEMETRY_DISABLED=1` (optional but recommended)
5. Click **Save and Deploy**. The first deploy hands you a `*.pages.dev` URL
   immediately.

### Custom domain

If you buy `cbgabler.com` (or similar) later:

1. **Pages → Custom domains → Set up a custom domain**, follow the wizard.
2. Update `SITE.url` in `src/data/site.ts` and `SITE_URL` in
   `astro.config.mjs` to the new canonical URL. (One edit each; that's it.)
3. Update `Sitemap:` in `public/robots.txt` to the same URL.

### Manual deploy (no GitHub connection)

```bash
npm run build
npx wrangler pages deploy dist --project-name cbgabler-portfolio
```

## Performance

Current bundle sizes (production build):

- Total `dist/`: ~2.6 MB
- Homepage HTML: ~20 KB
- Homepage CSS: ~8 KB
- Latin font subset: ~170 KB (Inter + Fraunces variable, loaded once and cached)
- Largest homepage image (architecture diagram): served as WebP at ~15–80 KB depending on viewport

Realistic homepage payload for a first-time visitor: **~250–300 KB**. Cached
visits: **~30 KB** (just HTML).

## Accessibility / SEO

- Semantic landmarks: `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`.
- Skip-to-content link in `BaseLayout.astro`.
- Heading hierarchy: one `<h1>` per page, then `<h2>` per section, etc.
- All images have `alt` text (rejected at the schema level if missing on hero images).
- Focus rings respect `:focus-visible` and use the accent color.
- `prefers-reduced-motion` disables the fade-up animation and arrow translate.
- OG / Twitter card meta tags on every page via `BaseLayout`.
- `sitemap-index.xml` + `robots.txt` for crawlers.

## To-do before going public

- [ ] **Academic-format CV** — the current `Carson_Gabler_Resume.pdf` is an
      industry resume. Replace with an academic CV before sharing with grad
      school audiences; just swap the file at the same path (or update
      `SITE.cv.file` in `site.ts`).
- [ ] **Catalytica hero image** — add a screenshot to
      `src/assets/projects/catalytica/` and reference it in the MDX
      frontmatter.
- [ ] **OG default image** — add `public/og-default.png` (1200×630) so shared
      links render a card on Slack/Twitter/LinkedIn.
- [ ] **Google Scholar profile** — set up at
      <https://scholar.google.com/citations> (5 minutes; useful for academic
      legibility even with no publications yet) and add the URL to
      `SITE.contact.scholar` in `site.ts`.
- [ ] **Cloudflare Web Analytics** — once deployed, enable in the Cloudflare
      dashboard; it doesn't require a cookie banner.

## License

All rights reserved. Personal portfolio.
