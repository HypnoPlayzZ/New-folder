// "Drop into cart" physics: spawns a token at the button and arcs it (rise +
// gravity fall) into the floating cart bubble, then pulses the bubble. Pure
// GSAP + a transient DOM node, so it works regardless of which stage is mounted.
import { gsap } from 'gsap';
import { useExperience } from './store';

export function flyToCart(originEl, { glyph = '🥟', color = '#d9a441' } = {}) {
  const cart = document.getElementById('sb-cart-bubble');
  if (!originEl || !cart) return;

  const o = originEl.getBoundingClientRect();
  const c = cart.getBoundingClientRect();
  const startX = o.left + o.width / 2;
  const startY = o.top + o.height / 2;
  const endX = c.left + c.width / 2;
  const endY = c.top + c.height / 2;

  const token = document.createElement('div');
  token.className = 'sb-fly-token';
  token.textContent = glyph;
  token.style.left = `${startX}px`;
  token.style.top = `${startY}px`;
  token.style.setProperty('--sb-token-color', color);
  document.body.appendChild(token);

  const dx = endX - startX;
  const dy = endY - startY;

  gsap.timeline({
    onComplete: () => {
      token.remove();
      useExperience.getState().pulseCart();
    },
  })
    // toss up and toward the cart
    .to(token, { duration: 0.46, x: dx * 0.55, y: dy * 0.5 - 130, scale: 1.35, ease: 'power2.out' })
    // gravity drop into the bubble
    .to(token, { duration: 0.5, x: dx, y: dy, scale: 0.22, ease: 'power2.in' })
    .to(token, { duration: 0.12, opacity: 0 }, '-=0.12');
}
