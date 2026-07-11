export default function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="wisp" />
      <div className="wisp" />
      <div className="arch-mini">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mascot.svg" alt="Steamy Bites mascot" className="footer-mascot" />
      </div>
      <p className="big">
        See you
        <br />
        after dark.
      </p>
      <div className="meta">
        <span>Laxmi Nagar, Delhi</span>
        <a href="mailto:hello@steamybites.in">hello@steamybites.in</a>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Steamy+Bites+Laxmi+Nagar+Delhi"
          target="_blank"
          rel="noopener"
        >
          Directions
        </a>
      </div>
      <p className="fine">© {new Date().getFullYear()} Steamy Bites · Momos & Cold Coffee</p>
    </footer>
  );
}
