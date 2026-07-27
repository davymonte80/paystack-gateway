import { useEffect, useState } from "react";
import { fetchPaymentCurrencies, initializePayment } from "./api";
import "./Checkout.css";

const FALLBACK_CURRENCIES = [
  ["KES", "Kenyan Shilling", "3"],
  ["USD", "US Dollar", "1"],
  ["NGN", "Nigerian Naira", "1"],
  ["GHS", "Ghanaian Cedi", "1"],
  ["ZAR", "South African Rand", "1"],
  ["XOF", "West African CFA Franc", "1"],
  ["EUR", "Euro", "1"],
  ["GBP", "British Pound", "1"],
  ["CAD", "Canadian Dollar", "1"],
  ["AUD", "Australian Dollar", "1"],
  ["CHF", "Swiss Franc", "1"],
  ["JPY", "Japanese Yen", "1"],
  ["CNY", "Chinese Yuan", "1"],
  ["INR", "Indian Rupee", "1"],
  ["AED", "United Arab Emirates Dirham", "1"],
  ["SGD", "Singapore Dollar", "1"],
  ["HKD", "Hong Kong Dollar", "1"],
  ["NZD", "New Zealand Dollar", "1"],
  ["SEK", "Swedish Krona", "1"],
  ["NOK", "Norwegian Krone", "1"],
  ["DKK", "Danish Krone", "1"],
  ["BRL", "Brazilian Real", "1"],
  ["MXN", "Mexican Peso", "1"],
].map(([code, name, minimum_amount]) => ({
  code,
  name,
  minimum_amount,
  enabled: true,
}));
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
  const [amount, setAmount] = useState(defaultAmount);
  const [currency, setCurrency] = useState(FALLBACK_CURRENCIES[0].code);
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

        setAmount(defaultAmount);
      })
      .catch((error) => {
        onError?.(error);
      });

    return () => {
      isMounted = false;
    };
  }, [defaultAmount, onError]);

  const changeCurrency = (event) => {
    setPaymentQuote(null);
    const nextCurrency = event.target.value;

    setCurrency(nextCurrency);
  };

  const changeAmount = (event) => {
    setPaymentQuote(null);
    setAmount(event.target.value);
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

      // KES is already the charge currency. Older backend deployments also
      // return only the authorization URL, so redirect rather than rendering
      // an incomplete conversion confirmation.
      if (
        currency === "KES" ||
        !result.charge_amount ||
        !result.charge_currency ||
        !result.display_amount ||
        !result.display_currency ||
        !result.exchange_rate
      ) {
        window.location.href = result.authorization_url;
        return;
      }

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
