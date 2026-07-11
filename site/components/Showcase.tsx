"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LazyVideo from "./LazyVideo";

const CARDS = [
  { kind: "video", src: "/media/macro-food.mp4", cap: "Macro · from the wok", cls: "sc-a" },
  { kind: "image", src: "/media/still3.jpg", cap: "Chilli · garlic · coriander", cls: "sc-b" },
  { kind: "image", src: "/media/still2.jpg", cap: "The steamer", cls: "sc-c" },
  { kind: "video", src: "/media/2.mp4", cap: "Steam, on the hour", cls: "sc-d" },
] as const;

export default function Showcase() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".show-card").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
          delay: (i % 2) * 0.12,
          scrollTrigger: { trigger: card, start: "top 85%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section" id="showcase" ref={root} aria-label="Food showcase">
      <p className="eyebrow">The Table</p>
      <h2 className="title">Worth staying up for</h2>
      <div className="showcase-grid">
        {CARDS.map((c) => (
          <figure className={`show-card ${c.cls}`} key={c.src}>
            {c.kind === "video" ? (
              <LazyVideo src={c.src} />
            ) : (
              /* stills extracted from the brand footage, already local */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.src} alt={c.cap} loading="lazy" />
            )}
            <figcaption className="cap">{c.cap}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
