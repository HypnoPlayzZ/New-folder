// Dynamic Level-of-Detail resolver.
// Picks a performance tier from devicePixelRatio, viewport width and core
// count, then exposes the knobs the scene uses: DPR cap, mesh subdivision,
// particle budget and whether to mount the heavy steam system at all.
import { useEffect, useMemo, useState } from 'react';
import { useExperience } from './store';

function resolveTier() {
  if (typeof window === 'undefined') return 'high';
  const w = window.innerWidth;
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;

  if (w < 768) return 'low';                 // mobile viewports
  if (dpr > 2 || cores <= 4) return 'mid';   // dense displays / low core count
  return 'high';
}

const PROFILES = {
  high: { dpr: [1, 2],   segments: 96, steamCount: 1400, bloom: true,  shadows: true },
  mid:  { dpr: [1, 1.5], segments: 64, steamCount: 700,  bloom: true,  shadows: false },
  low:  { dpr: [1, 1.25], segments: 36, steamCount: 320, bloom: false, shadows: false },
};

export function useLOD() {
  const setTier = useExperience((s) => s.setTier);
  const [tier, setLocalTier] = useState(resolveTier);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = resolveTier();
        setLocalTier(next);
        setTier(next);
      });
    };
    setTier(resolveTier());
    window.addEventListener('resize', onResize, { passive: true });
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(frame); };
  }, [setTier]);

  return useMemo(() => ({ tier, ...PROFILES[tier] }), [tier]);
}
