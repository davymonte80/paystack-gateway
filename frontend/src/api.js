const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function initializePayment({ email, amount, currency = "KES" }) {
  const response = await fetch(`${API_BASE_URL}/initialize/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount, currency }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message = data?.detail || data?.error || "Could not start payment.";
    throw new Error(message);
  }

  return data; // { authorization_url, access_code, reference }
}

export async function fetchPaymentCurrencies() {
  const response = await fetch(`${API_BASE_URL}/currencies/`);
  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message = data?.detail || data?.error || "Could not load payment currencies.";
    throw new Error(message);
  }

  return data; // { default_currency, enabled_currencies, supported_currencies }
}

export async function verifyPayment(reference) {
  const response = await fetch(`${API_BASE_URL}/verify/${reference}/`);
  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message = data?.detail || data?.error || "Could not verify payment.";
    throw new Error(message);
  }

  return data; // { reference, status, amount, ... }
}
