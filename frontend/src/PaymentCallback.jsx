import { useEffect, useState } from "react";
import { verifyPayment } from "./api";
import "./PaymentCallback.css";

/**
 * Mount this at the route set as PAYSTACK_CALLBACK_URL in the backend .env
 * (e.g. /payment/callback). Paystack redirects here with ?reference=...
 * after the supporter finishes on their hosted payment page.
 *
 * This always re-verifies with the backend — the redirect itself is
 * not proof of payment, only a signal to go check.
 */
export default function PaymentCallback() {
  const [reference] = useState(() =>
    new URLSearchParams(window.location.search).get("reference"),
  );
  const [state, setState] = useState(() =>
    reference
      ? { status: "checking", data: null, error: "" }
      : {
          status: "error",
          data: null,
          error: "No payment reference found.",
        },
  );

  useEffect(() => {
    if (!reference) return;

    verifyPayment(reference)
      .then((data) => setState({ status: data.status, data, error: "" }))
      .catch((error) =>
        setState({ status: "error", data: null, error: error.message }),
      );
  }, [reference]);

  return (
    <main className="callback-page">
      <section className="callback-card">
        {state.status === "checking" && (
          <>
            <span className="callback-spinner" aria-hidden="true" />
            <p className="callback-eyebrow">Just a moment</p>
            <h1>Confirming your coffee…</h1>
            <p>I’m checking in with Paystack now.</p>
          </>
        )}

        {state.status === "success" && (
          <>
            <span className="callback-status callback-status--success">☕</span>
            <p className="callback-eyebrow">You’re wonderful</p>
            <h1>Thank you so much!</h1>
            <p>
              Your coffee means a lot to me. Thanks for supporting what I make
              and giving me a little extra fuel to keep going.
            </p>
            <a className="callback-link" href="/">
              Back to David’s page
            </a>
          </>
        )}

        {state.status === "failed" && (
          <>
            <span className="callback-status callback-status--failed">×</span>
            <p className="callback-eyebrow">No worries</p>
            <h1>The tip didn’t go through.</h1>
            <p>You haven’t been charged. You can head back and try again.</p>
            <a className="callback-link" href="/">Try again</a>
          </>
        )}

        {state.status === "error" && (
          <>
            <span className="callback-status callback-status--failed">!</span>
            <p className="callback-eyebrow">Something went wrong</p>
            <h1>I couldn’t confirm the tip.</h1>
            <p>{state.error}</p>
            <a className="callback-link" href="/">Back to the support page</a>
          </>
        )}
      </section>
    </main>
  );
}
