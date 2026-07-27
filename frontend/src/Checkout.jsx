import { useEffect, useState } from "react";
import { fetchPaymentCurrencies, initializePayment } from "./api";
import "./Checkout.css";

const FALLBACK_CURRENCIES = [
  {
    code: "KES",
    name: "Kenyan Shilling",
    minimum_amount: "3",
    presets: [250, 750, 1250],
    enabled: true,
  },
];
const COFFEE_COUNTS = [1, 3, 5];
const REGION_CURRENCIES = {
  KE: "KES",
  NG: "NGN",
  GH: "GHS",
  ZA: "ZAR",
  CI: "XOF",
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  CH: "CHF",
  CN: "CNY",
  IN: "INR",
  JP: "JPY",
  AE: "AED",
  SG: "SGD",
  HK: "HKD",
  NZ: "NZD",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  BR: "BRL",
  MX: "MXN",
};

function visitorCurrency() {
  try {
    const locale = new Intl.Locale(navigator.languages?.[0] || navigator.language);
    return REGION_CURRENCIES[locale.region];
  } catch {
    return undefined;
  }
}

export default function Checkout({ defaultAmount = "", onError } = {}) {
  const [email, setEmail] = useState("");
  const [currencyOptions, setCurrencyOptions] = useState(FALLBACK_CURRENCIES);
  const [amount, setAmount] = useState(defaultAmount || String(FALLBACK_CURRENCIES[0].presets[0]));
  const [currency, setCurrency] = useState(FALLBACK_CURRENCIES[0].code);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentQuote, setPaymentQuote] = useState(null);

  const selectedCurrency = currencyOptions.find((option) => option.code === currency) || currencyOptions[0];
  const minimumAmount = Number(selectedCurrency.minimum_amount);

  useEffect(() => {
    let isMounted = true;

    fetchPaymentCurrencies()
      .then((data) => {
        if (!isMounted) return;

        const supportedCurrencies = data.supported_currencies?.length
          ? data.supported_currencies
          : FALLBACK_CURRENCIES;
        const enabledCurrencies = supportedCurrencies.filter((option) => option.enabled);
        const selectableCurrencies = enabledCurrencies.length
          ? supportedCurrencies
          : FALLBACK_CURRENCIES;
        const defaultCurrency = visitorCurrency() || data.default_currency || enabledCurrencies[0]?.code || FALLBACK_CURRENCIES[0].code;
        const defaultOption =
          enabledCurrencies.find((option) => option.code === defaultCurrency) ||
          enabledCurrencies[0] ||
          FALLBACK_CURRENCIES[0];

        setCurrencyOptions(selectableCurrencies);
        setCurrency(defaultOption.code);

        setSelectedPreset(0);
        setAmount(String(defaultOption.presets[0]));
      })
      .catch((error) => {
        onError?.(error);
      });

    return () => {
      isMounted = false;
    };
  }, [onError]);

  const choosePreset = (index) => {
    setSelectedPreset(index);
    setAmount(String(selectedCurrency.presets[index]));
  };

  const changeCurrency = (event) => {
    setPaymentQuote(null);
    const nextCurrency = event.target.value;
    const nextCurrencyOption =
      currencyOptions.find((option) => option.code === nextCurrency) || currencyOptions[0];

    setCurrency(nextCurrency);
    if (selectedPreset !== null) {
      setAmount(String(nextCurrencyOption.presets[selectedPreset]));
    }
  };

  const changeAmount = (event) => {
    setPaymentQuote(null);
    setAmount(event.target.value);
    setSelectedPreset(null);
  };

  const chooseCustomAmount = () => {
    setSelectedPreset(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (paymentQuote) {
      window.location.href = paymentQuote.authorizationUrl;
      return;
    }

    const trimmedEmail = email.trim();
    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount < minimumAmount) {
      setErrorMessage(`Choose or enter a tip amount of at least ${currency} ${minimumAmount}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await initializePayment({
        email: trimmedEmail || undefined,
        amount,
        currency,
      });
      setPaymentQuote({
        authorizationUrl: result.authorization_url,
        amount: result.charge_amount,
        currency: result.charge_currency,
        displayAmount: result.display_amount,
        displayCurrency: result.display_currency,
        exchangeRate: result.exchange_rate,
      });
      setIsSubmitting(false);
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
          <button
            type="button"
            className={selectedPreset === null ? "is-selected" : ""}
            onClick={chooseCustomAmount}
            aria-pressed={selectedPreset === null}
          >
            <span aria-hidden="true">✍️</span>
            <strong>Custom</strong>
            <small>amount</small>
          </button>
        </div>
      </fieldset>

      <div className="tip-fields">
        <label className="tip-field">
          <span>Email <small>(optional)</small></span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="For a receipt only"
            autoComplete="email"
          />
        </label>

        <div className="tip-row">
          <label className="tip-field tip-field--amount">
            <span>Tip amount</span>
            <input
              type="number"
              min={minimumAmount}
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
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code} disabled={option.enabled === false}>
                  {option.code}{option.enabled === false ? " — not enabled" : ""}
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

      {paymentQuote && (
        <p className="tip-footnote" role="status">
          {paymentQuote.displayCurrency} {paymentQuote.displayAmount} converts at {paymentQuote.exchangeRate}.
          You will be charged <strong>{paymentQuote.currency} {paymentQuote.amount}</strong>.
        </p>
      )}

      <button type="submit" className="tip-submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Opening Paystack…"
          : paymentQuote
            ? `Continue to pay ${paymentQuote.currency} ${paymentQuote.amount} ☕`
            : `Send ${amount ? `${currency} ${amount}` : "a coffee"} ☕`}
      </button>

      <p className="tip-footnote">
        Tip anonymously, or add an email only if you want a receipt. Pay securely with Paystack.
      </p>
    </form>
  );
}
