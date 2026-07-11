// ─────────────────────────────────────────────────────────────
// SteamyHome — the cinematic 3-stage scroll experience that replaces the
// old 2D home. Fixed full-bleed layers (video → WebGL → DOM overlays) sit
// behind a tall scroll spacer that drives the whole timeline through Lenis.
// All existing app plumbing (cart, checkout, routing) is preserved via props.
// ─────────────────────────────────────────────────────────────
import { Suspense, lazy, useEffect, useRef } from 'react';
import { useSmoothScroll } from './useSmoothScroll';
import { useLOD } from './useLOD';
import { useExperience } from './store';
import { SCROLL_VH } from './config';
import VideoLayers from './VideoLayers';
import HeroText from './ui/HeroText';
import MenuLane from './ui/MenuLane';
import CheckoutFinale from './ui/CheckoutFinale';
import CartBubble from './ui/CartBubble';
import './experience.css';

// Heavy three.js layer — code-split so it never blocks first paint.
const Scene3D = lazy(() => import('./Scene3D'));

function ProgressBar() {
  const ref = useRef();
  useEffect(() => {
    const apply = (p) => { if (ref.current) ref.current.style.transform = `scaleX(${p})`; };
    apply(useExperience.getState().progress);
    return useExperience.subscribe((s) => apply(s.progress));
  }, []);
  return <div className="sb-progress"><span ref={ref} /></div>;
}

export default function SteamyHome({ menu, cart, setCart, setCartOpen, setPage }) {
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  useSmoothScroll(true);
  const lod = useLOD();
  const setPointer = useExperience((s) => s.setPointer);

  // Normalized pointer for parallax / steamer tilt.
  useEffect(() => {
    const onMove = (e) => setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [setPointer]);

  // Exact cart shape used everywhere else in the app.
  const addToCart = (item) =>
    setCart((prev) => {
      const key = `${item.id}-${item.selectedSize}`;
      const ex = prev.find((c) => `${c.id}-${c.selectedSize}` === key);
      if (ex) return prev.map((c) => (`${c.id}-${c.selectedSize}` === key ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });

  return (
    <div className="sb-root" data-tier={lod.tier}>
      {/* Fixed cinematic stack */}
      <div className="sb-stage-fixed">
        <VideoLayers />
        <Suspense fallback={null}>
          <Scene3D lod={lod} />
        </Suspense>

        {/* DOM overlays */}
        <HeroText />
        <MenuLane menu={menu} addToCart={addToCart} />
        <CheckoutFinale cart={cart} onCheckout={() => setCartOpen(true)} />
      </div>

      <ProgressBar />
      <CartBubble count={cartCount} onOpen={() => setCartOpen(true)} />
      <button className="sb-fullmenu" onClick={() => setPage('menu')}>Browse full menu →</button>

      {/* Tall spacer that defines the scrollable timeline length */}
      <div className="sb-scroll-spacer" style={{ height: `${SCROLL_VH}vh` }} aria-hidden="true" />

      {/* Accessible, non-visual fallback so the page has real content/SEO */}
      <h1 className="sb-sr-only">Steamy Bites — momos, Italian, chowmein and burgers delivered hot in 30 minutes in Gurgaon.</h1>
    </div>
  );
}
