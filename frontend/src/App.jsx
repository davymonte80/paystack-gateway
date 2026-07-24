import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Checkout from "./Checkout";
import PaymentCallback from "./PaymentCallback";
import coffeeLogo from "../../coffee-logo.svg";
import "./App.css";

function CoffeeMark() {
  return (
    <img className="coffee-mark" src={coffeeLogo} alt="" aria-hidden="true" />
  );
}

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/david-monte-228a91387/",
  },
  { label: "X", href: "https://x.com/MonteCa99608914" },
  { label: "GitHub", href: "https://github.com/davymonte80" },
];

function SupportPage() {
  return (
    <div className="support-page">
      <header className="topbar">
        <Link className="personal-brand" to="/">
          <CoffeeMark />
          <span>David Monte</span>
        </Link>
        <nav className="topbar__nav" aria-label="Main navigation">
          <a className="topbar__link" href="#contact">Get in touch</a>
          <a className="coffee-button coffee-button--small" href="#support">
            Buy me a coffee <span aria-hidden="true">☕</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="support-hero">
          <div className="intro">
            <p className="eyebrow">A little corner of the internet</p>
            <h1>
              Hey, I’m D. Monte
              <br />
              <em>Buy me a coffee?</em>
            </h1>
            <p className="intro__copy">
              I make useful projects and share what I learn along the way. If
              something I’ve created made your day a little easier, you can
              leave a small, completely optional tip to say thanks.
            </p>
            <div className="coffee-note">
              <span aria-hidden="true">☕</span>
              <p>
                Every coffee helps me keep experimenting, building, and sharing
                more things with you.
              </p>
            </div>
          </div>

          <div className="tip-area" id="support">
            <div className="doodle doodle--one" aria-hidden="true">✦</div>
            <div className="doodle doodle--two" aria-hidden="true">~</div>
            <Checkout />
          </div>
        </section>

        <section className="contact-card" id="contact">
          <CoffeeMark />
          <div>
            <p className="eyebrow">Get in touch</p>
            <h2>My inbox is always open.</h2>
            <p>
              Have a question, feedback, or just want to say hi? Email me at{" "}
              <a href="mailto:davymonte80@gmail.com">
                davymonte80@gmail.com
              </a>{" "}
              — I read and reply to every message.
            </p>
          </div>
        </section>
      </main>

      <footer className="personal-footer">
        <div className="footer-intro">
          <Link className="personal-brand" to="/">
            <CoffeeMark />
            <span>David Monte</span>
          </Link>
          <p>Made with care and probably too much coffee.</p>
        </div>
        <nav className="social-nav" aria-label="Social links">
          {SOCIAL_LINKS.map((link) => (
            <a
              href={link.href}
              key={link.label}
              target="_blank"
              rel="noreferrer"
            >
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
        <div className="footer-action">
          <a className="coffee-button" href="#support">
            Buy me a coffee <span aria-hidden="true">☕</span>
          </a>
          <p>© {new Date().getFullYear()} David Monte</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SupportPage />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
