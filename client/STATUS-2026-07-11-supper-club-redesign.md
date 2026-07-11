# STATUS — 2026-07-11 — Ordering app redesigned to Supper Club

The customer ordering app (client/) now wears the marketing site's design system end-to-end.
**Zero logic changes** — every handler, API call, and state flow is untouched; only markup/CSS.

## What changed (presentation only)

- **Tokens** (`src/App.jsx` themes object): Night `#0c0a09`/ivory/gold, Day `#f2ebdd`/espresso/gold —
  same palette as `site/app/globals.css`. All components consume via existing `t.*` — untouched.
- **Fonts**: Poppins/Inter → Fraunces (display) + Instrument Sans (UI). `index.html` link,
  `App.css` body, root div + Toaster in `App.jsx`.
- **Accent**: every orange (`#FF8C00` family, ~150 sites in App.jsx/App.css) → gold family.
  Tailwind `orange-*` classes remapped to gold via `@theme` in `index.css` (no markup churn).
  Semantic greens (veg/success/live) intentionally kept.
- **Home**: new `src/SupperHome.jsx` (arch + smoke footage `public/media/1.mp4` + editorial
  headline + Order Now/Track Order). The old cinematic `SteamyHome` is **preserved** — see the
  comment in the `page === "home"` branch to swap back.
- **Menu**: `FoodCard` renders editorial dotted-leader rows (arch thumbnail, Fraunces name,
  half/full segmented pill, italic gold price, gold ADD). Old card JSX preserved inert as
  `legacyCard` inside the component. Rows grouped under gold category headers (`MenuPage`).
- **Navbar**: theme-aware home scrim, letterspaced wordmark, theme toggle now available on home
  (the new home supports Night AND Day; the old forced-dark special case is bypassed).
- **New files**: `src/supper.css` (sc-* classes), `src/SupperHome.jsx`, `public/media/`.
- Hero eyebrow copy: GURGAON → **LAXMI NAGAR** (matches the brief; one-line revert if wrong).

## Verified (browser, vite dev + clean `npm run build`)

Home Night render · menu rows + category grouping + search/pills · add-to-cart from rows
(badge increments) · cart drawer with coupon/address/Confirm Order ₹ total · theme toggle
dark↔light · page navigation. NOTE: during dev-server testing, HMR reloads from concurrent
edits can masquerade as broken navigation — test after edits settle.

## Sentinel

The repo's Sentinel guardrail blocked net-shrinking edits twice; user explicitly approved an
override for this redesign. Replaced blocks were preserved in-file (comments/inert code)
rather than deleted.
