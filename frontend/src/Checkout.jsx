import { useState } from "react";
import { initializePayment } from "./api";
import "./Checkout.css";

const CURRENCIES = ["USD", "KES", "NGN", "GHS", "ZAR"];
const COFFEE_PRESETS = {
  KES: [250, 750, 1250],
  NGN: [2500, 7500, 12500],
  GHS: [30, 90, 150],
  ZAR: [50, 150, 250],
  USD: [3, 9, 15],
};
const COFFEE_COUNTS = [1, 3, 5];

export default function Checkout({ defaultAmount = "", onError } = {}) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(defaultAmount);
  const [currency, setCurrency] = useState("USD");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const choosePreset = (index) => {
    setSelectedPreset(index);
    setAmount(String(COFFEE_PRESETS[currency][index]));
  };

  const changeCurrency = (event) => {
    const nextCurrency = event.target.value;
    setCurrency(nextCurrency);
    if (selectedPreset !== null) {
      setAmount(String(COFFEE_PRESETS[nextCurrency][selectedPreset]));
    }
  };

  const changeAmount = (event) => {
    setAmount(event.target.value);
    setSelectedPreset(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !amount) {
      setErrorMessage("Add your email and choose a tip amount to continue.");
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
    <form className="tip-card" onSubmit={handleSubmit} noValidate>
      <div className="tip-card__heading">
        <span className="tip-card__cup" aria-hidden="true">☕</span>
        <div>
          <p className="tip-kicker">Send a little support</p>
          <h2>Buy me a coffee</h2>
        </div>
      </div>

      <fieldset className="coffee-picker">
        <legend>Choose a coffee</legend>
        <div className="coffee-options">
          {COFFEE_COUNTS.map((count, index) => (
            <button
              type="button"
              className={selectedPreset === index ? "is-selected" : ""}
              key={count}
              onClick={() => choosePreset(index)}
              aria-pressed={selectedPreset === index}
            >
              <span aria-hidden="true">☕</span>
              <strong>{count}</strong>
              <small>{count === 1 ? "coffee" : "coffees"}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="tip-fields">
        <label className="tip-field">
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

        <div className="tip-row">
          <label className="tip-field tip-field--amount">
            <span>Tip amount</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={changeAmount}
              placeholder="Your amount"
              required
            />
          </label>

          <label className="tip-field tip-field--currency">
            <span>Currency</span>
            <select value={currency} onChange={changeCurrency}>
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {errorMessage && (
        <p className="tip-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button type="submit" className="tip-submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Opening Paystack…"
          : `Send ${amount ? `${currency} ${amount}` : "a coffee"} ☕`}
      </button>

      <p className="tip-footnote">
        Optional support. Pay securely with Paystack.
      </p>
    </form>
  );
}
