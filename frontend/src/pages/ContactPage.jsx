export default function ContactPage() {
  return (
    <>
      <header className="page-hero">
        <p className="eyebrow">We’re here to help</p>
        <h1>Let’s talk coffee.</h1>
        <p className="lede">
          Questions about an order, payment, or subscription? Reach out and
          we’ll get back to you as soon as we can.
        </p>
      </header>
      <section className="contact-list">
        <a href="mailto:support@coffee.example.com">
          <span>Email</span>
          <strong>support@coffee.example.com</strong>
          <small>Best for orders and payment questions</small>
        </a>
        <a href="tel:+254700123456">
          <span>Phone</span>
          <strong>+254 798 353 347</strong>
          <small>Monday–Saturday, 8:00–17:00 EAT</small>
        </a>
        <div>
          <span>Visit</span>
          <strong>Bean House, Nairobi</strong>
          <small>Suite 410, Kenya</small>
        </div>
      </section>
    </>
  );
}
