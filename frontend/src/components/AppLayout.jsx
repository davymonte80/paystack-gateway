import { Link, NavLink, Outlet } from "react-router-dom";
import Brand from "./Brand";
import Checkout from "../Checkout";

const NAV_LINKS = [
  { path: "/", label: "Home", end: true },
  { path: "/how-it-works", label: "How it works" },
  { path: "/contact", label: "Contact" },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Brand />
        <nav className="site-nav" aria-label="Primary navigation">
          {NAV_LINKS.map(({ path, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `site-nav__link${isActive ? " is-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <a className="header-cta" href="#checkout">
          Buy a coffee
        </a>
      </header>

      <main className="page-layout">
        <div className="page-content">
          <Outlet />
        </div>
        <aside className="checkout-rail" id="checkout" aria-label="Checkout">
          <div className="checkout-rail__sticky">
            <div className="checkout-rail__heading">
              <span className="status-dot" aria-hidden="true" />
              Secure Paystack checkout
            </div>
            <Checkout defaultAmount="1200" />
          </div>
        </aside>
      </main>

      <footer className="site-footer">
        <Brand />
        <p>Thoughtful coffee, paid for securely.</p>
        <nav aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/refunds">Refunds</Link>
        </nav>
        <p className="site-footer__copyright">
          © {new Date().getFullYear()} Coffee
        </p>
      </footer>
    </div>
  );
}
