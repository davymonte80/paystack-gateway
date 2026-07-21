import { useEffect, useState } from "react";
import { verifyPayment } from "./api";
import "./PaymentCallback.css";

/**
 * Mount this at the route set as PAYSTACK_CALLBACK_URL in the backend .env
 * (e.g. /payment/callback). Paystack redirects here with ?reference=...
 * after the customer finishes on their hosted payment page.
 *
 * This always re-verifies with the backend — the redirect itself is
 * not proof of payment, only a signal to go check.
 */
export default function PaymentCallback() {
  const [state, setState] = useState({ status: "checking", data: null, error: "" });

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");

    if (!reference) {
      setState({ status: "error", data: null, error: "No payment reference found." });
      return;
    }

    verifyPayment(reference)
      .then((data) => setState({ status: data.status, data, error: "" }))
      .catch((error) => setState({ status: "error", data: null, error: error.message }));
  }, []);

  return (
    <div className="callback-card">
      {state.status === "checking" && <p>Confirming your payment…</p>}

      {state.status === "success" && (
        <>
          <h2 className="callback-title callback-title--success">Payment successful</h2>
          <p>Reference: {state.data.reference}</p>
        </>
      )}

      {state.status === "failed" && (
        <>
          <h2 className="callback-title callback-title--failed">Payment failed</h2>
          <p>Reference: {state.data.reference}</p>
        </>
      )}

      {state.status === "error" && (
        <>
          <h2 className="callback-title callback-title--failed">Couldn't confirm payment</h2>
          <p>{state.error}</p>
        </>
      )}
    </div>
  );
}
