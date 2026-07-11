// Lenis ⇄ GSAP ScrollTrigger bridge.
// One RAF loop drives Lenis, ScrollTrigger, and our experience store so the
// video layers, the WebGL scene and the DOM overlays all read the exact same
// progress value on the same frame (no drift, no double rAF).
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExperience } from './store';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const setProgress = useExperience.getState().setProgress;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,        // native momentum on touch — cheaper on mobile
      touchMultiplier: 1.4,
    });

    const onScroll = (e) => {
      const limit = e.limit || 1;
      const progress = limit > 0 ? e.scroll / limit : 0;
      setProgress(progress, e.velocity || 0);
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger measurements correct as the (lazy) scene mounts.
    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [enabled]);
}
