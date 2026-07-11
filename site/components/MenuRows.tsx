"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { MenuCategory } from "@/lib/menu";
import { displayCategory } from "@/lib/menu";

const ORDER_URL = process.env.NEXT_PUBLIC_ORDER_URL;

/** A menu row is a link into the ordering app when its URL is configured. */
function Row({
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { "aria-label"?: string }) {
  if (ORDER_URL) {
    return (
      <a className="menu-row" href={ORDER_URL} target="_blank" rel="noopener" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <div className="menu-row" {...rest}>
      {children}
    </div>
  );
}

/**
 * Dotted-leader menu rows; hovering a row floats its dish photo alongside
 * the cursor in an arch-shaped frame. Ordering itself lives in the separate
 * ordering app — rows deep-link there, they don't carry a cart.
 */
export default function MenuRows({ categories }: { categories: MenuCategory[] }) {
  const [peek, setPeek] = useState<string | null>(null);
  const peekRef = useRef<HTMLDivElement>(null);

  const move = (e: React.MouseEvent) => {
    const el = peekRef.current;
    if (!el) return;
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
  };

  return (
    <div onMouseMove={peek ? move : undefined}>
      {categories.map((cat) => (
        <div className="menu-cat" key={cat.name}>
          <h3>{displayCategory(cat.name)}</h3>
          {cat.items.map((item) => (
            <Row
              key={item._id}
              aria-label={ORDER_URL ? `Order ${item.name} on the Steamy Bites app` : undefined}
              onMouseEnter={item.imageUrl ? () => setPeek(item.imageUrl!) : undefined}
              onMouseLeave={item.imageUrl ? () => setPeek(null) : undefined}
            >
              <h4>{item.name}</h4>
              <span className="leader" />
              <span className="price">
                {item.price.full != null && <>₹{item.price.full}</>}
                {item.price.half != null && (
                  <span className="half"> / half ₹{item.price.half}</span>
                )}
              </span>
              {ORDER_URL && <span className="go">order ↗</span>}
            </Row>
          ))}
        </div>
      ))}
      <div ref={peekRef} className={`menu-peek${peek ? " on" : ""}`} aria-hidden="true">
        {peek && (
          <Image src={peek} alt="" width={190} height={190} sizes="190px" />
        )}
      </div>
    </div>
  );
}
