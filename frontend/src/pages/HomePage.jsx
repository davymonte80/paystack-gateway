import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "shield",
    title: "Secure by design",
    copy: "Card details are handled on Paystack’s secure checkout, never on our servers.",
  },
  {
    icon: "globe",
    title: "Pay your way",
    copy: "Choose from KES, NGN, GHS, ZAR, or USD and pay in a few simple steps.",
  },
  {
    icon: "spark",
    title: "Instant confirmation",
    copy: "Every payment is verified before your coffee order is confirmed.",
  },
];

function FeatureIcon({ name }) {
  const paths = {
    shield: <path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18" /></>,
    spark: <path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Zm6 13 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />,
  };
  return <svg className="feature-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Good coffee, no payment drama</p>
          <h1>Your next great cup is one smooth checkout away.</h1>
          <p className="lede">
            Pay for freshly roasted coffee in seconds. Simple, secure, and
            built for coffee lovers across Africa and beyond.
          </p>
          <div className="button-row">
            <a className="button button--primary" href="#checkout">
              Get your coffee <span aria-hidden="true">→</span>
            </a>
            <Link className="button button--quiet" to="/how-it-works">
              See how it works
            </Link>
          </div>
          <div className="trust-row" aria-label="Checkout benefits">
            <span>Paystack secured</span>
            <span>5 currencies</span>
            <span>Instant verification</span>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <span className="hero__ring hero__ring--one" />
          <span className="hero__ring hero__ring--two" />
          <div className="coffee-cup">
            <span className="coffee-cup__steam coffee-cup__steam--one" />
            <span className="coffee-cup__steam coffee-cup__steam--two" />
            <span className="coffee-cup__body" />
            <span className="coffee-cup__handle" />
            <span className="coffee-cup__saucer" />
          </div>
          <div className="hero__badge">
            <strong>Freshly roasted</strong>
            <span>Made with care in Nairobi</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Why Coffee</p>
          <h2>A checkout as considered as the cup.</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <FeatureIcon name={feature.icon} />
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="story-card">
        <div>
          <p className="eyebrow">From bean to cup</p>
          <h2>Small-batch coffee, made easy to enjoy.</h2>
        </div>
        <p>
          From single-origin beans to recurring subscriptions and thoughtful
          gifts, Coffee brings the café experience to your doorstep.
        </p>
        <Link to="/how-it-works">Explore the journey →</Link>
      </section>
    </>
  );
}
