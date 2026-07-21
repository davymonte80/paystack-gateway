"""
Thin client around the Paystack REST API.

Keeping all Paystack HTTP calls in one service class means views stay
simple, and if Paystack's API ever changes shape, there's a single
place to update.
"""

import requests
from django.conf import settings


class PaystackError(Exception):
    """Raised when Paystack returns an error or an unexpected response."""


class PaystackService:
    BASE_URL = "https://api.paystack.co"
    TIMEOUT = 15  # seconds

    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self._headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    def initialize_transaction(self, *, email, amount, reference, callback_url=None, metadata=None):
        """
        Ask Paystack to open a transaction and return the authorization_url
        the customer should be redirected to in order to pay.

        `amount` is in the main currency unit (e.g. KES 500.00); Paystack
        expects the smallest unit (cents/kobo), so we convert here.
        """
        payload = {
            "email": email,
            "amount": int(round(float(amount) * 100)),
            "reference": reference,
        }
        if callback_url:
            payload["callback_url"] = callback_url
        if metadata:
            payload["metadata"] = metadata

        return self._post("/transaction/initialize", payload)

    def verify_transaction(self, reference):
        """Confirm the real status of a transaction directly with Paystack."""
        return self._get(f"/transaction/verify/{reference}")

    def _post(self, path, payload):
        try:
            response = requests.post(f"{self.BASE_URL}{path}", json=payload, headers=self._headers, timeout=self.TIMEOUT)
        except requests.RequestException as exc:
            raise PaystackError(f"Could not reach Paystack: {exc}") from exc
        return self._parse(response)

    def _get(self, path):
        try:
            response = requests.get(f"{self.BASE_URL}{path}", headers=self._headers, timeout=self.TIMEOUT)
        except requests.RequestException as exc:
            raise PaystackError(f"Could not reach Paystack: {exc}") from exc
        return self._parse(response)

    @staticmethod
    def _parse(response):
        try:
            data = response.json()
        except ValueError as exc:
            raise PaystackError("Paystack returned a non-JSON response") from exc

        if not response.ok or not data.get("status", True):
            message = data.get("message", "Unknown Paystack error")
            raise PaystackError(message)

        return data
