<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Steamy Bites marketing site

Cinematic marketing site for Steamy Bites (momos cafe, Laxmi Nagar, Delhi). Separate from the
Vite ordering app in `../client` — never couple them; "Order Now" links out via
`NEXT_PUBLIC_ORDER_URL`.

- **Design contract:** `../docs/superpowers/specs/2026-07-11-steamy-bites-site-design.md`
  ("Supper Club" direction). Tokens live in `app/globals.css` — components must use the CSS
  variables (`--bg`, `--ink`, `--gold`, …), never hardcoded colors, or the Night/Day toggle breaks.
- **Stack is deliberately curated:** GSAP + Lenis + R3F only. Do not add Framer Motion,
  component kits, or a second animation runtime.
- **Menu data:** `lib/menu.ts` — live API with ISR + committed fallback. Keep the Cloudinary
  scrub; other hosts aren't in `next.config.ts` remotePatterns and will crash next/image.
- **Motion rules:** everything respects `prefers-reduced-motion`; heavy layers (R3F steam)
  are code-split and unmount off-screen. Latest state: `STATUS-2026-07-11.md`.
