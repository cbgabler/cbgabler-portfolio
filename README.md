# cbgabler-portfolio

Personal portfolio site for Me, built with [Astro](https://astro.build),
Tailwind v4, and TypeScript. Designed for Academic/Industry audience

Live: <https://cbgabler.pages.dev>

## Stack

- **Astro 5** — static-site build, zero client JS by default.
- **Tailwind 4** — design tokens (`@theme {}`) live in `src/styles/globals.css`.
- **MDX** — long-form project case studies in `src/content/projects/`, schema-validated.
- **Self-hosted variable fonts** — Fraunces (display serif) + Inter (sans) via
  `@fontsource-variable/*`, no Google Fonts dependency.
- **`astro-icon` + `lucide`** — tree-shaken icons, no client JS.
- **`@astrojs/sitemap`** — generates `sitemap-index.xml` at build time.
