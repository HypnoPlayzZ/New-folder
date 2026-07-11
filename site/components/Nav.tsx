import ThemeToggle from "./ThemeToggle";

const ORDER_URL = process.env.NEXT_PUBLIC_ORDER_URL;

export default function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <span className="est">Laxmi Nagar</span>
      <span className="wordmark">
        {/* Delhi badge, theme-swapped in CSS: green badge on Day, white badge on Night */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-badge-dark.svg" alt="" className="nav-mascot logo-dark" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-badge-light.svg" alt="" className="nav-mascot logo-light" />
        Steamy Bites
      </span>
      <div className="links">
        <a href="#menu">Menu</a>
        <a href="#showcase">The Food</a>
        <a href="#visit">Visit</a>
        {ORDER_URL && (
          <a href={ORDER_URL} target="_blank" rel="noopener">
            Order
          </a>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
