"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Steamy+Bites+Laxmi+Nagar+Delhi";

/**
 * Stylized map panel: abstract street grid in hairlines, an animated gold
 * route from Laxmi Nagar Metro to the cafe. Deliberately not a tile map —
 * it stays in the design system, and the real directions live one click away.
 */
export default function LocationSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!root.current) return;
    const route = root.current.querySelector<SVGPathElement>(".route");
    if (!route) return;
    const len = route.getTotalLength();
    route.style.strokeDasharray = `${len}`;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        route,
        { strokeDashoffset: len },
        {
          strokeDashoffset: 0,
          duration: 2.2,
          ease: "power2.inOut",
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        }
      );
      gsap.from(".loc-pin", {
        opacity: 0,
        y: -14,
        duration: 0.7,
        ease: "bounce.out",
        delay: 1.9,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section" id="visit" ref={root} aria-label="Location">
      <p className="eyebrow">Find Us</p>
      <h2 className="title">Near Laxmi Nagar Metro</h2>
      <div className="loc-wrap">
        <div className="loc-map">
          <svg viewBox="0 0 640 420" role="img" aria-label="Stylized route from Laxmi Nagar Metro station to Steamy Bites">
            {/* abstract street grid */}
            <g stroke="var(--hair2)" strokeWidth="1">
              <path d="M0 80 H640 M0 170 H640 M0 260 H640 M0 350 H640" />
              <path d="M110 0 V420 M230 0 V420 M350 0 V420 M470 0 V420 M570 0 V420" />
              <path d="M0 420 L200 220 M420 0 L640 200" opacity="0.6" />
            </g>
            {/* metro line */}
            <path d="M0 305 C 120 300, 200 316, 330 308 S 560 290, 640 296" stroke="var(--dim)" strokeWidth="2.5" fill="none" opacity="0.55" />
            {/* the walk */}
            <path className="route" d="M96 302 C 140 250, 170 240, 230 226 S 330 180, 380 150 S 440 118, 468 106" stroke="var(--acc)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="1" />
            {/* metro station */}
            <g>
              <circle cx="96" cy="302" r="10" fill="none" stroke="var(--dim)" strokeWidth="2.5" />
              <circle cx="96" cy="302" r="3.5" fill="var(--dim)" />
              <text x="96" y="342" textAnchor="middle" fill="var(--dim)" fontSize="11" letterSpacing="2.5" style={{ textTransform: "uppercase" }}>
                Laxmi Nagar Metro
              </text>
            </g>
            {/* the cafe: an arch pin */}
            <g className="loc-pin">
              <path d="M452 106 a16 16 0 0 1 32 0 v20 h-32 z" fill="none" stroke="var(--acc)" strokeWidth="2" />
              <circle cx="468" cy="108" r="2.6" fill="var(--acc)" />
              <text x="468" y="76" textAnchor="middle" fill="var(--acc)" fontSize="12" letterSpacing="3">
                STEAMY BITES
              </text>
            </g>
          </svg>
        </div>
        <div className="loc-info">
          <p className="eyebrow" style={{ textAlign: "left" }}>
            Laxmi Nagar · Delhi
          </p>
          <h3>A short walk from the metro, a long way from ordinary.</h3>
          <p>
            Find us in Laxmi Nagar, East Delhi — steaming until late. Momos, chilli
            potato, chowmein and cold coffee, made to order every evening.
          </p>
          <a className="cta" href={MAPS_URL} target="_blank" rel="noopener">
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}
