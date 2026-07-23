import { Link } from "react-router-dom";

const STEPS = [
  {
    number: "01",
    title: "Choose your amount",
    copy: "Enter the value of your coffee order and select the currency that works for you.",
  },
  {
    number: "02",
    title: "Pay securely",
    copy: "We send you to Paystack’s encrypted checkout to complete your payment safely.",
  },
  {
    number: "03",
    title: "Get confirmation",
    copy: "You return to Coffee while we verify the transaction and confirm your order.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <header className="page-hero">
        <p className="eyebrow">How it works</p>
        <h1>Three small steps. One very good cup.</h1>
        <p className="lede">
          We keep checkout clear and secure from the moment you choose your
          coffee to the moment your payment is confirmed.
        </p>
      </header>

      <section className="steps" aria-label="Payment steps">
        {STEPS.map((step) => (
          <article className="step-card" key={step.number}>
            <span className="step-card__number">{step.number}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.copy}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="reassurance-card">
        <div className="reassurance-card__icon" aria-hidden="true">✓</div>
        <div>
          <p className="eyebrow">Your payment stays protected</p>
          <h2>Built on a trusted payment flow.</h2>
          <p>
            Coffee never stores your card details. Paystack handles sensitive
            payment information, and our server independently verifies the
            final transaction status before confirming an order.
          </p>
        </div>
      </section>

      <section className="mini-cta">
        <div>
          <h2>Ready when you are.</h2>
          <p>Use the checkout beside this guide to pay for your coffee.</p>
        </div>
        <Link className="button button--outline" to="/contact">
          Need help?
        </Link>
      </section>
    </>
  );
}
