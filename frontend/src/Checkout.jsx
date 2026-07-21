import { useState } from "react";
import { initializePayment } from "./api";
import "./Checkout.css";

const CURRENCIES = ["KES", "NGN", "GHS", "ZAR", "USD"];


export default function Checkout({ defaultAmount = "", onError } = {}) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(defaultAmount);
  const [currency, setCurrency] = useState("KES");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !amount) {
      setErrorMessage("Enter your email and an amount to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { authorization_url: authorizationUrl } = await initializePayment({
        email,
        amount,
        currency,
      });
      window.location.href = authorizationUrl;
    } catch (error) {
      setErrorMessage(error.message);
      onError?.(error);
      setIsSubmitting(false);
    }
  };

  return (
    <form className="checkout-card" onSubmit={handleSubmit} noValidate>
      <h2 className="checkout-title">Checkout</h2>
      <p className="checkout-subtitle">Pay securely with Paystack</p>

      <label className="checkout-field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>

      <div className="checkout-row">
        <label className="checkout-field checkout-field--amount">
          <span>Amount</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1000.00"
            required
          />
        </label>

        <label className="checkout-field checkout-field--currency">
          <span>Currency</span>
          <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>

      {errorMessage && (
        <p className="checkout-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button type="submit" className="checkout-submit" disabled={isSubmitting}>
        {isSubmitting ? "Redirecting to Paystack…" : `Pay ${amount ? `${currency} ${amount}` : "now"}`}
      </button>

      <p className="checkout-footnote">You'll be redirected to Paystack's secure page to complete payment.</p>
    </form>
  );
}
