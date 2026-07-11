// Single source of truth for the scroll-driven experience.
// Updated imperatively (no React re-renders) by the Lenis loop; R3F reads it
// inside useFrame and DOM overlays subscribe selectively. Keeping scroll state
// out of React state is what keeps the 60fps budget intact.
import { create } from 'zustand';

export const useExperience = create((set) => ({
  // 0..1 across the entire tall scroll container
  progress: 0,
  // signed scroll velocity (px/frame-ish, from Lenis) used for video scrubbing
  velocity: 0,
  // normalized pointer in [-1, 1] for parallax / steamer tilt
  pointer: { x: 0, y: 0 },
  // performance tier resolved by useLOD: 'high' | 'mid' | 'low'
  tier: 'high',
  // pulse counter — bump to make the floating cart bubble react
  cartPulse: 0,

  setProgress: (progress, velocity) => set({ progress, velocity }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setTier: (tier) => set({ tier }),
  pulseCart: () => set((s) => ({ cartPulse: s.cartPulse + 1 })),
}));

// Imperative getters for hot paths (useFrame) — avoids selector subscriptions.
export const expState = () => useExperience.getState();
