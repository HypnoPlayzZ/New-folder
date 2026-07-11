"use client";

import { useEffect, useRef } from "react";

/** Gold ring cursor + click ripple. Fine pointers only; never on touch. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !ref.current) return;

    const cur = ref.current;
    document.body.classList.add("cursor-on");

    let cx = 0, cy = 0, tx = 0, ty = 0;
    let rafId = 0;
    cur.style.opacity = "0"; // parked offscreen until the pointer first moves
    const onMove = (e: PointerEvent) => {
      if (cur.style.opacity === "0") {
        cx = e.clientX;
        cy = e.clientY;
        cur.style.opacity = "1";
      }
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cur.style.left = `${cx}px`;
      cur.style.top = `${cy}px`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onOver = (e: PointerEvent) => {
      const interactive = (e.target as HTMLElement).closest?.("a,button");
      document.body.classList.toggle("cursor-hover", Boolean(interactive));
    };
    const onDown = (e: PointerEvent) => {
      const r = document.createElement("span");
      r.className = "ripple";
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 650);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      document.body.classList.remove("cursor-on", "cursor-hover");
    };
  }, []);

  return <div ref={ref} className="sb-cursor" aria-hidden="true" />;
}
