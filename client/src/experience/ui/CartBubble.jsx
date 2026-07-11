// Persistent floating cart bubble (bottom-right). Tokens from "Add to Cart"
// land here; it pulses on each landing (driven by the store's cartPulse).
import { useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { gsap } from 'gsap';
import { useExperience } from '../store';

export default function CartBubble({ count = 0, onOpen }) {
  const ref = useRef();
  const pulse = useExperience((s) => s.cartPulse);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    gsap.fromTo(
      ref.current,
      { scale: 1 },
      { scale: 1.28, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
  }, [pulse]);

  return (
    <button
      id="sb-cart-bubble"
      ref={ref}
      className="sb-cart-bubble"
      onClick={onOpen}
      aria-label={`Open cart, ${count} items`}
    >
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && <span className="sb-cart-count">{count}</span>}
    </button>
  );
}
