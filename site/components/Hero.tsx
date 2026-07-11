"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";

const SteamLayer = dynamic(() => import("./SteamLayer"), { ssr: false });

const ORDER_URL = process.env.NEXT_PUBLIC_ORDER_URL;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [steamOn, setSteamOn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The three.js bundle is the single heaviest script on the page, so the
    // steam layer waits for the first real interaction instead of blocking
    // hydration; the CSS wisps carry the ambience until then. It still
    // unmounts whenever the hero is off screen.
    let io: IntersectionObserver | undefined;
    let visible = true;
    let interacted = false;
    const update = () => setSteamOn(visible && interacted);
    const onFirstInteraction = () => {
      interacted = true;
      update();
      opts.forEach(([evt]) => window.removeEventListener(evt, onFirstInteraction));
    };
    const opts: [string][] = [["pointermove"], ["scroll"], ["touchstart"], ["keydown"]];
    if (!reduced && root.current) {
      opts.forEach(([evt]) =>
        window.addEventListener(evt, onFirstInteraction, { passive: true, once: false })
      );
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          update();
        },
        { rootMargin: "10% 0px" }
      );
      io.observe(root.current);
    }

    // Cinematic entrance: arch draws in, video breathes up, lines unmask.
    let ctx: gsap.Context | undefined;
    if (!reduced && root.current) {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".arch", { opacity: 0, scale: 0.96, transformOrigin: "50% 100%", duration: 1.4 })
          .from(".hero-video-wrap", { opacity: 0, duration: 1.6 }, 0.2)
          .from(".nav > *", { opacity: 0, y: -14, stagger: 0.08, duration: 0.8 }, 0.5)
          .from(".reveal-line > span", { yPercent: 110, stagger: 0.12, duration: 1.1 }, 0.7)
          .from(".hero .sub, .hero .ctas, .hero .scroll-cue", { opacity: 0, y: 12, stagger: 0.12, duration: 0.8 }, 1.2);
      }, root);
    }

    return () => {
      io?.disconnect();
      ctx?.revert();
      opts.forEach(([evt]) => window.removeEventListener(evt, onFirstInteraction));
    };
  }, []);

  return (
    <section className="hero" ref={root} aria-label="Steamy Bites">
      <div className="hero-video-wrap">
        <div className="arch-seat" />
        <video
          src="/media/1.mp4"
          poster="/media/poster-hero.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="wisp" />
        <div className="wisp" />
        <div className="wisp" />
        {steamOn && <SteamLayer />}
      </div>
      <div className="arch" role="presentation" />
      <div className="hero-vignette" />

      <h1>
        <span className="reveal-line">
          <span>Steam, gold light, and the</span>
        </span>
        <span className="reveal-line">
          <span>
            <em>best momos</em> in Laxmi Nagar.
          </span>
        </span>
      </h1>
      <p className="sub">Momos · Cold Coffee · Open Late</p>
      <div className="ctas">
        <a className="cta" href={ORDER_URL ?? "#menu"} {...(ORDER_URL ? { target: "_blank", rel: "noopener" } : {})}>
          Order Now
        </a>
        <a className="cta" href="#visit">
          Visit the Cafe
        </a>
      </div>
      <div className="scroll-cue">Scroll</div>
    </section>
  );
}
