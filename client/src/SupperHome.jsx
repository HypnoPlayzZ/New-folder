import './supper.css';

/**
 * Supper Club home — the ordering app's landing page, matching the marketing
 * site's design (arch hero over the steam footage, editorial type, gold
 * hairlines). Presentation only: every action routes into the existing app
 * (setPage / setCartOpen), no new data flows.
 */
export default function SupperHome({ setPage, isDark }) {
  const ground = isDark ? '#0c0a09' : '#f2ebdd';
  const ink = isDark ? '#efe6d8' : '#241c12';
  const dim = isDark ? '#9c8f78' : '#6a5e4b';

  return (
    <div style={{ background: ground, color: ink }}>
      <section className="sc-hero" style={{ '--sc-hero-ground': ground }} aria-label="Steamy Bites">
        <div className="sc-hero-video-wrap">
          <video
            src="/media/1.mp4"
            poster="/media/poster-hero.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
        <div className="sc-arch" role="presentation" />
        <div className="sc-wisp" />
        <div className="sc-wisp" />
        <div className="sc-wisp" />

        <span className="sc-eyebrow">Steamy Bites · Laxmi Nagar</span>
        <h1>
          Steam, gold light, and the <em>best momos</em> in Laxmi Nagar.
        </h1>
        <p className="sc-sub" style={{ color: dim }}>
          Momos · Cold Coffee · Open Late
        </p>
        <div className="sc-ctas">
          <button className="sc-cta" style={{ color: ink }} onClick={() => setPage('menu')}>
            Order Now
          </button>
          <button className="sc-cta" style={{ color: ink }} onClick={() => setPage('orders')}>
            Track Order
          </button>
        </div>
        <div className="sc-scroll-cue" style={{ color: dim }}>
          From the bamboo steamer
        </div>
      </section>

      <footer className="sc-strip" style={{ color: dim }}>
        <span>
          <b>Steamy Bites</b>
        </span>
        <span>Laxmi Nagar, Delhi</span>
        <span>Near Laxmi Nagar Metro</span>
        <span>Open Late</span>
      </footer>
    </div>
  );
}
