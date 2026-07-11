"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LazyVideo from "./LazyVideo";

const BEATS = [
  {
    label: "Every evening",
    video: "/media/2.mp4",
    line: (
      <>
        Hand-folded, <em>steamed on the hour</em>, never waiting under a lamp.
      </>
    ),
  },
  {
    label: "The good stuff",
    video: "/media/3.mp4",
    line: (
      <>
        Chilli, garlic, coriander — <em>the steam does the talking.</em>
      </>
    ),
  },
  {
    label: "Late nights",
    video: "/media/hero-steam.mp4",
    line: (
      <>
        Cold coffee on the side, <em>open till late.</em>
      </>
    ),
  },
];

export default function ScrollStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !root.current) {
      // Reduced motion: show the last beat statically, no pin.
      root.current
        ?.querySelectorAll<HTMLElement>(".story-beat, .story-video")
        .forEach((el, i, all) => {
          el.style.opacity = i >= all.length - 1 ? "1" : "0";
        });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const beats = gsap.utils.toArray<HTMLElement>(".story-beat");
      const videos = gsap.utils.toArray<HTMLElement>(".story-video");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: `+=${beats.length * 85}%`,
          pin: ".story-viewport",
          scrub: 0.6,
        },
      });
      beats.forEach((beat, i) => {
        const last = i === beats.length - 1;
        tl.to(videos[i], { opacity: 1, duration: 0.5 }, i)
          .fromTo(beat, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45 }, i + 0.1);
        if (!last) {
          // outgoing and incoming beats cross-fade — the viewport never goes black,
          // and the final beat stays on screen while the pin releases
          tl.to(beat, { opacity: 0, y: -40, duration: 0.4 }, i + 0.72)
            .to(videos[i], { opacity: 0, duration: 0.5 }, i + 0.85);
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="story" ref={root} aria-label="Our food">
      <div className="story-viewport">
        {BEATS.map((b) => (
          <LazyVideo key={b.video} className="story-video" src={b.video} />
        ))}
        <div className="story-scrim" />
        {BEATS.map((b, i) => (
          <div className="story-beat" key={i}>
            <span className="label">{b.label}</span>
            <h2>{b.line}</h2>
          </div>
        ))}
      </div>
    </section>
  );
}
