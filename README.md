# cbgabler-portfolio

A minimal personal portfolio template built with **Vite + React + TypeScript**.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

- `npm run dev` — start the dev server with HMR
- `npm run build` — type-check and build for production into `dist/`
- `npm run preview` — preview the production build locally

## Project structure

```
.
├── index.html              # HTML entry
├── public/                 # Static assets (favicon, etc.)
├── api/
│   └── github-events.ts    # Vercel serverless proxy (private GH events)
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Main page (edit this)
│   ├── App.css             # Page styles
│   ├── index.css           # Global styles / theme variables
│   └── components/
│       ├── LiveActivity.tsx
│       └── LiveActivity.css
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Where to edit

- **Content** — `src/App.tsx` (hero text, projects array, contact info)
- **Theme colors** — CSS variables at the top of `src/index.css`
- **Layout / styles** — `src/App.css`
- **Page title / meta** — `index.html`

## Deploying

The production build outputs to `dist/`. It's a static site, so it works
anywhere, but the **Live Activity** feature requires a serverless function,
so Vercel (or another host with serverless support) is the smoothest path.

## Live Activity (private GitHub events)

The `LiveActivity` component shows your most recent GitHub event. By default
in dev it hits the **public** events endpoint. In production it hits a
serverless proxy at `/api/github-events` that uses an authenticated token to
include **private** repo activity.

### Setup (Vercel)

1. Create a GitHub PAT at <https://github.com/settings/tokens>:
   - Classic PAT: enable the `repo` scope.
   - Fine-grained: grant read access to the repos whose events you want.
2. In your Vercel project: **Settings → Environment Variables → add**
   `GITHUB_TOKEN` = `<your token>`. Apply to Production (and Preview if you
   want it there too).
3. Deploy. The proxy in `api/github-events.ts` is auto-detected by Vercel.

### Local testing of the proxy

```bash
npm i -g vercel
cp .env.example .env   # fill in GITHUB_TOKEN
vercel dev             # runs Vite + the /api function together
```

### Security note

Never put a PAT in client-side code or commit `.env`. The token only ever
lives on Vercel's servers; the browser only sees the proxied JSON.
