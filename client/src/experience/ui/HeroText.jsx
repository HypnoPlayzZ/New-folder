// Stage 1 typographic overlay. Big display line with mix-blend so it reads
// against both the flame video and the glowing steamer. Imperatively driven —
// it lifts and dissolves as the steam rises into it.
import { useEffect, useRef } from 'react';
import { useExperience } from '../store';
import { STAGES, stageProgress, clamp01 } from '../config';

export default function HeroText() {
  const root = useRef();
  const hint = useRef();

  useEffect(() => {
    const apply = (progress) => {
      const hero = stageProgress(progress, STAGES.hero.start, STAGES.hero.end);
      if (root.current) {
        const out = clamp01((hero - 0.45) / 0.55);
        root.current.style.opacity = (1 - out).toFixed(3);
        root.current.style.transform = `translateY(${-out * 60}px)`;
        root.current.style.letterSpacing = `${out * 6}px`;
      }
      if (hint.current) hint.current.style.opacity = clamp01(1 - hero * 6).toFixed(3);
    };
    apply(useExperience.getState().progress);
    return useExperience.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <div className="sb-hero-text" ref={root}>
      <span className="sb-eyebrow">STEAMY BITES · LAXMI NAGAR</span>
      <h1 className="sb-hero-headline">
        <span>CRAVE IT.</span>
        <span>ORDER IT.</span>
        <span className="sb-hero-love">LOVE IT.</span>
      </h1>
      <p className="sb-hero-sub">Bamboo-steamed. Wok-fired. At your door in 30 minutes.</p>
      <div className="sb-scroll-hint" ref={hint}>
        <span>SCROLL TO PLATE UP</span>
        <span className="sb-scroll-bar"><i /></span>
      </div>
    </div>
  );
}
