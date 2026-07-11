// Three full-bleed HTML5 video layers (raw <video> via refs), crossfaded by
// scroll progress and scrubbed in speed by scroll velocity — the "true
// scrubbing" feel from the brief, done without re-rendering React on scroll.
import { useEffect, useRef } from 'react';
import { VIDEOS, smoothstep } from './config';
import { useExperience } from './store';

const FADE = 0.05; // crossfade width in progress units

export default function VideoLayers() {
  const refs = useRef([]);
  const rateRef = useRef(VIDEOS.map(() => 1));

  useEffect(() => {
    // Drive opacity + playbackRate straight off the store on every scroll tick.
    const apply = (progress, velocity) => {
      const speed = Math.min(2.4, Math.abs(velocity) * 0.05); // velocity → extra rate
      VIDEOS.forEach((v, i) => {
        const el = refs.current[i];
        if (!el) return;
        const [s, e] = v.range;
        // First layer is visible from the very top (no fade-in from black);
        // subsequent layers crossfade in over their leading edge.
        const fadeIn = i === 0 ? 1 : smoothstep(s, s + FADE, progress);
        const op = fadeIn * (1 - smoothstep(e - FADE, e, progress));
        el.style.opacity = op.toFixed(3);

        const visible = op > 0.03;
        if (visible && el.paused) el.play().catch(() => {});
        else if (!visible && !el.paused) el.pause();

        if (visible) {
          // Ease the rate toward its target so scrubbing feels organic, not jumpy.
          const target = 0.55 + speed;
          rateRef.current[i] += (target - rateRef.current[i]) * 0.12;
          el.playbackRate = Math.max(0.25, Math.min(4, rateRef.current[i]));
        }
      });
    };

    // Prime once, then subscribe to imperative store updates.
    const { progress, velocity } = useExperience.getState();
    apply(progress, velocity);
    const unsub = useExperience.subscribe((s) => apply(s.progress, s.velocity));
    return unsub;
  }, []);

  return (
    <div className="sb-videos" aria-hidden="true">
      {VIDEOS.map((v, i) => (
        <video
          key={v.key}
          ref={(el) => (refs.current[i] = el)}
          className="sb-video"
          src={v.src}
          muted
          loop
          playsInline
          preload="auto"
          style={{ opacity: 0 }}
        />
      ))}
      <div className="sb-video-scrim" />
    </div>
  );
}
