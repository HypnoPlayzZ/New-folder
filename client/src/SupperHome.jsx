import './supper.css';

/**
 * Quiet Heat home — the ordering app's landing page, matching the marketing
 * site's design (full-bleed dimmed steam footage, one sans voice, hairline
 * boxed CTAs, electric-blue accent). Presentation only: every action routes
 * into the existing app (setPage), no new data flows.
 */
export default function SupperHome({ setPage, isDark }) {
  const ground = isDark ? '#050505' : '#f4f4f4';
  const ink = isDark ? '#ededed' : '#111214';
  const dim = isDark ? '#9aa0a6' : '#5f6368';

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

        <img
          src={isDark ? '/logo-badge-dark.svg' : '/logo-badge-light.svg'}
          alt=""
          className="sc-hero-badge"
        />
        {/* wordmark = the logo's own outlined type (Fraunces), identical everywhere */}
        <img
          src={isDark ? '/steamy-wordmark-dark.svg' : '/steamy-wordmark-light.svg'}
          alt="Steamy Bites"
          className="sc-hero-wordmark"
        />
        <span className="sc-eyebrow">Laxmi Nagar · Delhi</span>
        <h1>
          Momos. Cold coffee.
          <br />
          Nothing else matters <em>after 8pm.</em>
        </h1>
        <div className="sc-ctas">
          <button
            className="sc-cta sc-cta-fill"
            style={{ color: ground }}
            onClick={() => setPage('menu')}
          >
            Order Now
          </button>
          <button className="sc-cta" style={{ color: ink }} onClick={() => setPage('orders')}>
            Track Order
          </button>
        </div>
        <div className="sc-scroll-cue" style={{ color: dim }}>
          From the steamer
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
