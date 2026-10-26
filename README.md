# Pilot App — Frontend

Nuxt 4 mobile web app for Susi Air pilots: sign in, hours-to-limit dashboard with trend chart, documents with urgency badges, monthly duty calendar.
Live: `https://pilotfrontend.vercel.app/`
Backend repo: `https://github.com/reinfork/Pilot-App-Backend`

## Run

Prerequisite: Node 22.

```bash
npm install
npm run dev      # :3000 — expects the backend on :8000 (see env below)
npm run build    # production build
npm run preview  # serve the production build locally
```

## Environment

| Var | Required where | Effect |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | Production builds | Backend URL. Defaults to `http://localhost:8000` for local dev. Must be set **before** building on Vercel — public runtime config is inlined at build time, so changing it requires a redeploy. |

No `.env` file is used or needed. Local dev works with zero env vars (backend defaults to localhost).

## Screens

- `/login` — username/password form, inline error on 401, show/hide password toggle.
- `/` — greeting header (`/pilot/me`), 4 limit cards (Daily/Weekly/Monthly/Annual), interactive trend chart (`/flight-hours/summary`), documents list (`/documents`).
- `/schedule` — month calendar with prev/next (`/schedules`), day cells colored by `base_color`, tick when `count_logbooks === count_schedules`, legend below.
- `/schedule/[date]` — placeholder detail route (spec'd, minimal).

## Main choices (and why)

- **Nuxt 4 + Pinia + SCSS, no UI library.** File routing and auto-imports cover the app's needs; a component library would be unused weight.
- **One `$api` plugin** (`app/plugins/api.ts`). Attaches the Bearer token and turns any 401 into clear-token → `/login`. One shared place instead of per-page auth handling.
- **Memory-only token.** Refresh = re-login. Matches a demo session model with no persistence code.
- **`chart.js` direct, no wrapper.** Limit line is a constant second dataset; chart.js auto-registration is one import. Rolling sums stay server-side — the only frontend math is the y-domain: `max(res.max, ceil(peak))`, red line at `limit`, never clamp data.
- **Per-page `useFetch`, no cache layer.** Six small requests on Home; a cache (or TanStack Query) only pays off with refetch/dedup needs.
- **Scoped styles in sibling `.scss` files.** Same scoping as inline blocks, co-located per component, no global-namespace risk.
- **Bottom nav: Home + Schedule only.** Logbook/More have no backend endpoints, so shipping them would be dead nav.

## Deploy (Vercel)

Import this repo (Nuxt auto-detected). Set `NUXT_PUBLIC_API_BASE` to the backend URL, then deploy. No `vercel.json` needed.

## Planned future changes

- Revisit memory-only token if refresh-logout becomes unwanted (persist + TTL against the 24h backend expiry).
- Add Logbook/More navigation when the backend serves those surfaces.
- Swap the chart approach only if pan/zoom is needed (wrapper lib or annotation plugin).
- Commit the Edge-driven verification scripts as CI e2e if regression protection matters (currently run ad-hoc).
- Per-environment API URLs via Vercel env scopes (production vs preview) if preview backends appear.
