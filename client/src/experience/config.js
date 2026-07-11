// ─────────────────────────────────────────────────────────────
// Steamy Bites — cinematic experience configuration
// Everything that an art-director might want to retune lives here.
// ─────────────────────────────────────────────────────────────

// Charcoal-black + neon-green identity.
export const PALETTE = {
  ink: '#070809',        // deepest charcoal background
  charcoal: '#0d0f12',   // panel charcoal
  smoke: '#15181d',      // raised surface
  line: 'rgba(255,255,255,0.08)',
  text: '#f4f5f7',
  muted: '#9aa0aa',
  faint: '#565d68',
  neon: '#4d9fff',       // primary neon green
  neonDeep: '#1f6fd6',   // saturated green for gradients
  neonGlow: 'rgba(77,159,255,0.55)',
  ember: '#ff7a18',      // warm steam/flame highlight (hero)
  emberGlow: 'rgba(255,138,0,0.5)',
};

// Total scroll length of the experience, in viewport heights.
export const SCROLL_VH = 640;

// Stage scroll ranges as fractions of total progress (0..1).
export const STAGES = {
  hero:     { start: 0.00, end: 0.30 },
  menu:     { start: 0.32, end: 0.66 },
  checkout: { start: 0.68, end: 1.00 },
};

// Full-bleed video layers. Swap the `src` here if the stage mapping is wrong —
// this is the single place that binds files to stages.
export const VIDEOS = [
  { key: 'hero',     src: '/videos/hero-steam.mp4',     range: [0.00, 0.34] },
  { key: 'macro',    src: '/videos/macro-food.mp4',     range: [0.30, 0.70] },
  { key: 'delivery', src: '/videos/delivery-rush.mp4',  range: [0.64, 1.00] },
];

// The four hero categories bound to 3D models on the carousel.
// `pick` is the menu item id (from MENU_DATA) used for the real add-to-cart.
export const CATEGORIES = [
  { key: 'Momos',    label: 'Steamed Momos',  pick: 1,  accent: '#4d9fff', model: 'momo',
    blurb: 'Hand-folded, bamboo-steamed, drop-dead delicate.' },
  { key: 'Italian',  label: 'Wood-Fire Italian', pick: 5, accent: '#7fb8ff', model: 'pizza',
    blurb: 'Blistered crust, molten mozzarella, fresh basil.' },
  { key: 'Chowmein', label: 'Wok Chowmein',   pick: 9,  accent: '#a8ccff', model: 'wok',
    blurb: 'Smoke off the wok, tossed at full flame.' },
  { key: 'Burgers',  label: 'Loaded Burgers', pick: 11, accent: '#3d8be6', model: 'burger',
    blurb: 'Stacked, saucy, two-hands-required.' },
];

export const PROMO_CODE = 'FIRST50';

// Helpers ------------------------------------------------------
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Map a global progress value into a 0..1 local progress for [start,end].
export function stageProgress(progress, start, end) {
  return clamp01((progress - start) / (end - start));
}

// Smoothstep easing for crossfades and reveals.
export function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export const lerp = (a, b, t) => a + (b - a) * t;

// Which category is in the carousel spotlight for a given global progress.
// Lives here (three-free) so the DOM lane can import it without pulling the
// WebGL scene into the main bundle.
export function activeCategoryIndex(progress) {
  const menu = stageProgress(progress, STAGES.menu.start, STAGES.menu.end);
  return Math.round(menu * (CATEGORIES.length - 1));
}
