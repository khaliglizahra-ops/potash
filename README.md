# Nükleon Lab — B2B e-commerce

Next.js 16 (App Router) · React Three Fiber · Motion · Tailwind 4 · SQLite (`node:sqlite`, no native add-ons).
Requires **Node ≥ 22.13**.

```bash
npm install
npm run dev          # http://localhost:3000
npm run models       # regenerate the placeholder GLB models in public/models (Draco-compressed)
npm run build && npm start
```

## What lives where
| | |
|---|---|
| `src/lib/data/*` | Seed catalogue (products, categories, brands, articles). Loaded into SQLite on first run only; after that **/admin is the source of truth**. |
| `data/nukleon.db` | SQLite file (products, orders, quotes, customers). Path: `DATABASE_PATH`. |
| `uploads/` | Files uploaded from the admin (images, GLB, PDF). Served at `/uploads/*`. Path: `UPLOAD_DIR`. |
| `public/models/*.glb` | Parametric placeholder 3D models. Replace with real CAD exports (Draco GLB) and set the path in the admin. |
| `/admin` | Admin panel (password = `ADMIN_PASSWORD`). |

## Deploying to Hostinger (Node.js plan / VPS)
1. `npm run build` → creates `.next/standalone`.
2. Upload `.next/standalone/*`, plus `.next/static` → `<app>/.next/static` and `public` → `<app>/public`.
3. Set the environment variables from `.env.example` in hPanel. **Point `DATABASE_PATH` and `UPLOAD_DIR` at a folder outside the app directory.**
4. Startup file: `server.js`, Node 22. Put the site behind HTTPS (the session cookie is `secure` in production).
5. First visit seeds the database. Sign in at `/admin`, review prices and technical values (products marked **taslak** use placeholder data).

## Before going live
- Replace placeholder prices/specs (admin → Ürünler), set real bank details (`BANK_*`), review `/yasal/*` texts with counsel.
- Put real iyzico keys in the environment and test one sandbox order (card flow was not exercised without keys).
- Back up `DATABASE_PATH` and `UPLOAD_DIR` regularly.

## Static demo on GitHub Pages
`.github/workflows/pages.yml` builds a **read-only demo** (`NEXT_PUBLIC_DEMO=1`, static export) on every push to `main`:
catalogue, filters, search, 3D viewer, compare, favourites and cart (browser-only) work; checkout, quote/support forms,
accounts and `/admin` are disabled because they need the Node server + SQLite. The workflow runs `scripts/prepare-demo.mjs`,
which deletes the server-only routes **in the CI checkout** — never run it on your working copy.
