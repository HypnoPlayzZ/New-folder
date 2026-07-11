# Steamy Bites — Marketing Site Design Spec

**Date:** 2026-07-11 · **Status:** Approved (direction picked via live artifact; user said "build it")

## What this is

A new cinematic marketing website for Steamy Bites (momos & cold coffee cafe, Laxmi Nagar, Delhi),
built as a **separate Next.js + TypeScript app in `site/`**. The existing Vite ordering app
(`client/`) stays untouched; "Order Now" deep-links into it. Goal: an award-grade site that makes
people say "I've never seen a cafe website like this" — while shipping fast and ranking for
Laxmi Nagar food searches.

## Decisions already made (do not re-litigate)

| Decision | Choice |
|---|---|
| Platform | New Next.js + TS marketing site in `site/`; ordering app untouched |
| Food visuals | Photo/video-first + WebGL treatment; **no** fake photoreal 3D food |
| Scope v1 | Core cinematic 6 sections (below); about/gallery/testimonials/reviews = v2 |
| Art direction | **Supper Club** — dark luxury editorial (picked from 4 live takes) |
| Themes | **Night (default) + Day**, user toggle; token-driven |
| Stack | Curated, not the kitchen-sink brief (rationale below) |

## Art direction — "Supper Club"

Dark luxury editorial over the user's real AI-generated footage (bamboo steamer, steam, neon-lit
kitchen — `1.mp4`, `2.mp4`, `3.mp4`, 720p H.264, 10s loops).

- **Type:** Fraunces (300 display, italic accents) + Instrument Sans (UI, small-caps letterspaced labels)
- **Night tokens:** bg `#0C0A09`, ink `#EFE6D8`, gold `#C9A96A`, dim `#7A6F5F`
- **Day tokens:** bg `#F2EBDD`, ink `#241C12`, gold `#A9803E`, dim `#8B7D66`
- **Signature motifs:** the gold hairline **arch** (video clipped inside it = "dark window on an
  ivory wall" in Day mode), dotted-leader menu rows with italic prices, film grain, steam wisps,
  gold ring cursor.
- Reference implementation: the published artifact (Supper Club, Night/Day) — treat it as the
  visual contract for hero + menu typography.

## Sections (v1)

1. **Hero** — full-viewport footage in/behind the arch, cinematic wordmark entrance, headline
   "Steam, gold light, and the best momos in Laxmi Nagar.", CTAs (Order Now → ordering app,
   Visit the Cafe → location section), scroll cue, steam particles extending the footage.
2. **Scroll story** — GSAP ScrollTrigger-pinned sequence: steam moves, footage crossfades
   (1.mp4 → 2.mp4 → 3.mp4 moments), text reveals, parallax layers.
3. **Menu** — live data from `GET https://steamybitesbackend.onrender.com/api/menu` (ISR,
   revalidate ~1h, build-time fallback snapshot committed to repo since Render free tier
   cold-starts). Cloudinary item photos with WebGL/hover treatment. Dotted-leader luxury rows,
   half/full prices in ₹.
4. **Food showcase** — macro footage + Cloudinary photography with displacement/liquid hover,
   steam-on-hover, ingredient particles. No 3D food models.
5. **Location** — stylized dark-gold custom map (not default Leaflet tiles), animated route
   Laxmi Nagar Metro → cafe, address, hours, "Get Directions" link to Google Maps.
6. **Cinematic footer** — steam fades out, arch reprise, contact + hours, quiet ending.

Cross-cutting: custom gold-ring cursor (fine pointers only), magnetic/squash micro-interactions,
Lenis smooth scroll, film grain overlay, `prefers-reduced-motion` honored everywhere, keyboard
navigable, ARIA labels, mobile-first responsive.

## Stack (curated — deviation from the original brief is deliberate)

Next.js (App Router) + TypeScript + Tailwind, GSAP + ScrollTrigger, Lenis, React Three Fiber +
drei (steam particle layer + shader transitions ONLY where DOM/CSS can't do it), next/image,
next/font. **Excluded on purpose:** Framer Motion + Motion One + React Spring + Theatre.js +
Matter.js + OGL + Spline + Lottie + Shadcn/Aceternity/Magic UI — four competing animation
runtimes and three component kits would wreck the 90+ Lighthouse / 60fps target and produce a
template look. One scroll runtime (GSAP), one smooth-scroll (Lenis), one 3D runtime (R3F).

## Performance & SEO

- Budgets: Lighthouse 90+, 60fps scroll, hero footage lazy/poster-first, code-split R3F
  (dynamic import, `ssr: false`), fonts subset via next/font.
- SEO: SSG/ISR pages, metadata + OpenGraph, LocalBusiness (Restaurant) JSON-LD with Laxmi Nagar
  address, target phrases: "best momos in Laxmi Nagar", "cafe near Laxmi Nagar Metro",
  "cold coffee Delhi".
- 720p footage caveat: grain overlay masks softness; re-render at 1080p later = file swap.
  Generator watermark (bottom-right) must be cropped via overscan or re-exported clean.

## Error handling

- Menu API down/cold → serve committed snapshot (`site/data/menu-fallback.json`); never an
  empty menu.
- Video fails/reduced-motion/save-data → poster frame + static gradient; page fully usable
  without WebGL/JS animations.

## Testing / verification

- `npm run build` clean (type-safe, no ESLint errors).
- Browser walkthrough of all 6 sections in Night + Day, desktop + mobile viewport, with
  screenshots; reduced-motion pass; Lighthouse run before calling v1 done.

## v2 backlog (explicitly deferred)

About/timeline, gallery, testimonials, Google reviews, background music toggle, Theatre-grade
camera choreography, real 3D environment work, Hindi/bilingual copy.
