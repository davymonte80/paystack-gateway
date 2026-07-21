# Paystack Payment Gateway (Django + React)

A working payment integration: Django REST backend that talks to Paystack,
and a React checkout component for the frontend. Card/mobile-money entry
happens on Paystack's own hosted page — your servers never see or store
card details.

## How it works

1. Customer fills the `Checkout` form (email + amount) and submits.
2. React calls your backend's `POST /api/payments/initialize/`.
3. The backend creates a local `Transaction` record, asks Paystack to open
   a transaction, and returns an `authorization_url`.
4. React redirects the browser to that URL — the customer pays on Paystack.
5. Paystack redirects back to your `PAYSTACK_CALLBACK_URL` (e.g.
   `/payment/callback?reference=TXN-XXXX`), where `PaymentCallback` calls
   `GET /api/payments/verify/<reference>/` to confirm the real status.
6. Separately, Paystack also calls your `POST /api/payments/webhook/` with a
   signed `charge.success` event — this is the authoritative source of
   truth in production, since a customer can close the tab before step 5.

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and fill in your real Paystack test keys from
# https://dashboard.paystack.com/#/settings/developer

python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

The API is now live at `http://localhost:8000/api/payments/`.

### Backend endpoints

| Method | Path                              | Purpose                          |
|--------|------------------------------------|-----------------------------------|
| POST   | `/api/payments/initialize/`       | Start a checkout, get `authorization_url` |
| GET    | `/api/payments/verify/<reference>/` | Confirm a transaction's real status |
| POST   | `/api/payments/webhook/`          | Receives signed events from Paystack |

### Webhook setup (for production)

In your Paystack dashboard → Settings → API Keys & Webhooks, set the
webhook URL to `https://your-domain.com/api/payments/webhook/`. Paystack
signs every request with `x-paystack-signature`; the view verifies it
using your secret key before trusting the payload.

## 2. Frontend setup

```bash
cd frontend
# if you don't already have a React app, scaffold one, e.g.:
#   npm create vite@latest . -- --template react
npm install

cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:8000
```

Use the component:

```jsx
import Checkout from "./Checkout";

function App() {
  return <Checkout defaultAmount="500" />;
}
```

Add a route for the callback page (React Router example):

```jsx
import PaymentCallback from "./PaymentCallback";

<Route path="/payment/callback" element={<PaymentCallback />} />
```

Make sure the route path matches `PAYSTACK_CALLBACK_URL` in the backend `.env`.

## Security notes

- **Secret key** (`PAYSTACK_SECRET_KEY`) lives only in `backend/.env` and is
  never sent to the browser.
- **Public key** is not even needed with this redirect-based flow, since
  the frontend never calls Paystack directly — it only calls your backend.
- Both `.env` files are covered by `.gitignore` — commit `.env.example`
  only, never `.env`.
- Amount validation happens both client-side (basic) and server-side
  (`InitializePaymentSerializer`) — never trust the client alone.
- Webhook signature is verified with `hmac.compare_digest` to avoid
  timing attacks.
- Always re-verify a transaction server-side (`verify_payment`) rather
  than trusting the redirect query string — a customer could edit the URL.

## Going further

- Switch `sqlite3` to PostgreSQL for production (`DATABASES` in `settings.py`).
- Add authentication/order linkage so a `Transaction` is tied to a real order/user.
- Add Celery or Django signals if you want to trigger fulfillment logic on `charge.success`.
