# Crowdfunding-3D — Bambu Lab A1 mini Group Fund

A real-time, multi-language (**English, Nederlands, Français, Español**) group crowdfunding website to fairly split the cost of a **Bambu Lab A1 mini 3D Printer** and official Bambu Lab filament spools among family and friends.

## Features

- **Transparent Cost Breakdown**: Displays original printer price (€179.00), discount applied (−€120.00), net printer cost (€59.00), and configurable filament spools (default: 2 × €10.99/kg = €21.98 → **€80.98 total**).
- **Dynamic Equal Split (`Total ÷ Total People`)**:
  - As more people join, the equal base share drops automatically in real time.
  - Every participant can customize their contribution **upward only** — strictly enforced on both the client and PostgreSQL (`amount >= Total ÷ Total People`, never less).
  - Participants adding extra € can either keep their extra boost on top of the live equal split or lock a fixed total pledge.
- **Official Bambu Lab Filament Color Poll**: Participants vote on the exact **PLA Basic, filament with spool / 1 kg** colors and SKUs from the Bambu Lab store picker. Eleven available colors are enabled by default; **Cocoa Brown (10802)** and **Mistletoe Green (10502)** are preloaded but disabled because they were greyed out in the store picker. The organizer can enable either with one click in Admin.
- **4 Languages Built-In**: Instant 1-click switcher between **English (`EN`)**, **Nederlands (`NL`)**, **Français (`FR`)**, and **Español (`ES`)**, with automatic browser language detection.
- **Live Organizer Admin Panel**: Protected by a server-verified bcrypt-hashed Admin Code on Supabase (`app_private` schema + `SECURITY DEFINER` RPCs):
  - Edit printer model, retail price, discount, net price, total filament spools, spool price, extra costs, campaign status (`open` / `locked` / `completed`), announcement banner, and payment instructions (IBAN / Payconiq / Revolut / PayPal).
  - Add, edit, remove, or mark participants as **Paid / Unpaid**.
  - Add, edit, pin, hide/show, or delete filament colors and manage votes.
  - Change the Admin Code anytime.
  - **Reset Everything to Defaults**: A typed-confirmation factory reset restores the original Bambu Lab A1 mini campaign, pricing, two-spool setup, payment settings, and 13-color catalog; permanently removes all participants and votes; clears custom colors; and restores the original Admin Code. The admin is signed out after a successful reset.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend & Realtime**: Supabase PostgreSQL (Row-Level Security, `pgcrypto` admin verification, atomic split validation RPCs, and Realtime `postgres_changes`)
- **Hosting Ready**: Pre-configured for both **Vercel** (`vercel.json`) and **Netlify** (`netlify.toml`)

## Local Development

```bash
npm install
npm run dev
```

## Database Migration

The PostgreSQL schema, RLS policies, RPC functions, and catalog updates are versioned in `supabase/migrations/`. Apply them in filename order:

```
supabase/migrations/20261104220000_init_crowdfunding_3d.sql
supabase/migrations/20261104233000_bambu_a1_mini_and_official_filaments.sql
supabase/migrations/20261104234500_admin_reset_everything.sql
```

## Deploying to Vercel or Netlify

1. Connect this repository in **Vercel** or **Netlify**.
2. Build command: `npm run build` · Output directory: `dist`.
3. Optional environment variables (see `.env.example`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
