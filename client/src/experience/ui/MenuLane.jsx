// Stage 2 right-hand lane: product details for whichever category the 3D
// carousel has rotated into the spotlight. Re-renders only when the active
// index actually changes (scroll itself never sets React state here).
import { useEffect, useRef, useState } from 'react';
import { Star, Clock, Plus } from 'lucide-react';
import { CATEGORIES, STAGES, stageProgress, clamp01, activeCategoryIndex } from '../config';
import { useExperience } from '../store';
import { flyToCart } from '../cartFly';

const GLYPH = { momo: '🥟', pizza: '🍕', wok: '🍜', burger: '🍔' };

export default function MenuLane({ menu, addToCart }) {
  const root = useRef();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const apply = (progress) => {
      const idx = activeCategoryIndex(progress);
      setActive((cur) => (cur === idx ? cur : idx));
      if (root.current) {
        const m = stageProgress(progress, STAGES.menu.start, STAGES.menu.end);
        const inStage = progress > STAGES.menu.start - 0.04 && progress < STAGES.menu.end + 0.04;
        const fade = clamp01(Math.min(m / 0.08, (1 - m) / 0.08));
        root.current.style.opacity = (inStage ? fade : 0).toFixed(3);
        root.current.style.pointerEvents = inStage && fade > 0.5 ? 'auto' : 'none';
      }
    };
    apply(useExperience.getState().progress);
    return useExperience.subscribe((s) => apply(s.progress));
  }, []);

  const cat = CATEGORIES[active];
  // Resolve a real menu item for this category (server menu first, else static).
  const item = menu.find((m) => m.category === cat.key && m.available !== false) || menu.find((m) => m.category === cat.key);

  const onAdd = (e) => {
    if (!item) return;
    const size = item.halfPrice ? 'full' : 'full';
    addToCart({ ...item, selectedSize: size, selectedPrice: item.fullPrice });
    flyToCart(e.currentTarget, { glyph: GLYPH[cat.model] || '🍽️', color: cat.accent });
  };

  return (
    <div className="sb-menu-lane" ref={root}>
      <div className="sb-lane-rail">
        {CATEGORIES.map((c, i) => (
          <div key={c.key} className={`sb-rail-item ${i === active ? 'is-active' : ''}`}>
            <span className="sb-rail-dot" style={{ background: i === active ? c.accent : 'transparent', borderColor: c.accent }} />
            {c.label}
          </div>
        ))}
      </div>

      <div className="sb-lane-card" key={cat.key} style={{ '--cat': cat.accent }}>
        <span className="sb-lane-index">0{active + 1} / 0{CATEGORIES.length}</span>
        <h2 className="sb-lane-title">{cat.label}</h2>
        <p className="sb-lane-blurb">{cat.blurb}</p>

        {item && (
          <>
            <div className="sb-lane-meta">
              <span><Star className="w-4 h-4" /> {item.rating}</span>
              <span><Clock className="w-4 h-4" /> {item.prepTime}</span>
              <span className="sb-lane-name">{item.name}</span>
            </div>
            <div className="sb-lane-buy">
              <span className="sb-lane-price">₹{item.fullPrice}</span>
              <button className="sb-add-btn" onClick={onAdd} style={{ '--cat': cat.accent }}>
                <Plus className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
