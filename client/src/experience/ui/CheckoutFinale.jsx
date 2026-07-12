// Stage 3: the impulse-checkout finale over the delivery-rush video.
// Cart summary + a magnetic checkout button wrapped in a continuous neon-green
// organic wave (animated SVG stroke + flowing glow). Routes into the real cart.
import { useEffect, useRef } from 'react';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { PROMO_CODE, STAGES, stageProgress, clamp01 } from '../config';
import { useExperience } from '../store';

export default function CheckoutFinale({ cart, onCheckout }) {
  const root = useRef();

  useEffect(() => {
    const apply = (progress) => {
      if (!root.current) return;
      const c = stageProgress(progress, STAGES.checkout.start, STAGES.checkout.end);
      const fade = clamp01((c - 0.08) / 0.18);
      root.current.style.opacity = fade.toFixed(3);
      root.current.style.transform = `translateY(${(1 - fade) * 40}px)`;
      root.current.style.pointerEvents = fade > 0.6 ? 'auto' : 'none';
    };
    apply(useExperience.getState().progress);
    return useExperience.subscribe((s) => apply(s.progress));
  }, []);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + (i.selectedPrice ?? i.fullPrice) * i.qty, 0);

  return (
    <div className="sb-checkout" ref={root}>
      <span className="sb-eyebrow">THE 30-MINUTE RUSH</span>
      <h2 className="sb-checkout-title">Hot. Fast.<br />At your door.</h2>

      <div className="sb-checkout-summary">
        <div className="sb-sum-row">
          <span>{count} item{count === 1 ? '' : 's'} in your bag</span>
          <span className="sb-sum-total">₹{total}</span>
        </div>
        <div className="sb-sum-perks">
          <span><Zap className="w-3.5 h-3.5" /> FIRST50 applied</span>
          <span><Clock className="w-3.5 h-3.5" /> ~30 min delivery</span>
        </div>
      </div>

      <MagneticButton className="sb-checkout-btn" onClick={onCheckout} strength={0.6}>
        {/* Animated organic neon wave riding the border */}
        <svg className="sb-wave-border" viewBox="0 0 600 96" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="sbNeon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a6741f" />
              <stop offset="50%" stopColor="#d9a441" />
              <stop offset="100%" stopColor="#a6741f" />
            </linearGradient>
          </defs>
          <rect className="sb-wave-rect" x="3" y="3" width="594" height="90" rx="46" ry="46"
            fill="none" stroke="url(#sbNeon)" strokeWidth="2.5" />
        </svg>
        <span className="sb-checkout-label">
          GET IT IN 30 MINS · USE {PROMO_CODE}
          <ArrowRight className="w-5 h-5" />
        </span>
      </MagneticButton>

      <p className="sb-checkout-fine">No surge. Free delivery over ₹250. Cancel anytime before the wok fires.</p>
    </div>
  );
}
