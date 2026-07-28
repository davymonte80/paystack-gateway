import { useEffect, useState } from "react";
import { fetchPaymentCurrencies, initializePayment } from "./api";
import "./Checkout.css";

const FALLBACK_CURRENCIES = [
  ["KES", "Kenyan Shilling"],
  ["USD", "US Dollar"],
  ["NGN", "Nigerian Naira"],
  ["GHS", "Ghanaian Cedi"],
  ["ZAR", "South African Rand"],
  ["XOF", "West African CFA Franc"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["CAD", "Canadian Dollar"],
  ["AUD", "Australian Dollar"],
  ["CHF", "Swiss Franc"],
  ["JPY", "Japanese Yen"],
  ["CNY", "Chinese Yuan"],
  ["INR", "Indian Rupee"],
  ["AED", "United Arab Emirates Dirham"],
  ["SGD", "Singapore Dollar"],
  ["HKD", "Hong Kong Dollar"],
  ["NZD", "New Zealand Dollar"],
  ["SEK", "Swedish Krona"],
  ["NOK", "Norwegian Krone"],
  ["DKK", "Danish Krone"],
  ["BRL", "Brazilian Real"],
  ["MXN", "Mexican Peso"],
].map(([code, name]) => ({
  code,
  name,
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
    const locale = new Intl.Locale(
      navigator.languages?.[0] || navigator.language,
    );
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

  useEffect(() => {
    let isMounted = true;

    fetchPaymentCurrencies()
      .then((data) => {
        if (!isMounted) return;

        const currencyByCode = new Map(
          FALLBACK_CURRENCIES.map((option) => [option.code, option]),
        );
        for (const option of data.supported_currencies || []) {
          const fallback = currencyByCode.get(option.code);
          currencyByCode.set(option.code, {
            ...fallback,
            ...option,
            // A display currency is converted to KES, not sent to Paystack.
            enabled: true,
          });
        }
        const selectableCurrencies = Array.from(currencyByCode.values());
        const defaultCurrency =
          visitorCurrency() ||
          data.default_currency ||
          FALLBACK_CURRENCIES[0].code;
        const defaultOption =
          selectableCurrencies.find(
            (option) => option.code === defaultCurrency,
          ) ||
          selectableCurrencies[0] ||
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

    if (
      !amount ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setErrorMessage(
        "Enter a tip amount greater than zero.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await initializePayment({
        email: trimmedEmail || undefined,
        amount,
        currency,
      });

    
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
        <span className="tip-card__cup" aria-hidden="true">
          ☕
        </span>
        <div>
          <p className="tip-kicker">Send a little support</p>
          <h2>Buy me a coffee</h2>
        </div>
      </div>

      <div className="tip-fields">
        <label className="tip-field">
          <span>
            Email <small>(optional)</small>
          </span>
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
              min="0.01"
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
                <option
                  key={option.code}
                  value={option.code}
                  disabled={option.enabled === false}
                >
                  {option.code}
                  {option.enabled === false ? " — not enabled" : ""}
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
          {paymentQuote.displayCurrency} {paymentQuote.displayAmount} converts
          at {paymentQuote.exchangeRate}. to Kenyan shillings. You will be
          charged{" "}
          <strong>
            {paymentQuote.currency} {paymentQuote.amount}
          </strong>
          .
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
        Tip anonymously, or add an email only if you want a receipt. Pay
        securely with Paystack.All payments are converted to Kenyan shillings
        (KES) at the current exchange rate.
      </p>
    </form>
  );
}
