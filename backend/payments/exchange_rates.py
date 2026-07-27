from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

import requests
from django.conf import settings


class ExchangeRateError(Exception):
    """Raised when a foreign amount cannot be safely quoted in KES."""


def convert_to_charge_currency(amount, source_currency):
    """Return (KES amount, rate) using the configured server-side FX provider."""
    charge_currency = settings.PAYSTACK_CHARGE_CURRENCY
    if source_currency == charge_currency:
        return amount.quantize(Decimal("0.01")), Decimal("1")

    url = settings.PAYSTACK_EXCHANGE_RATE_URL.format(
        base=source_currency,
        quote=charge_currency,
    )
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        rate = Decimal(str(response.json()["rate"]))
    except (requests.RequestException, InvalidOperation, KeyError, TypeError, ValueError) as exc:
        raise ExchangeRateError("Could not obtain a current exchange rate. Please try again.") from exc

    if rate <= 0:
        raise ExchangeRateError("The exchange-rate provider returned an invalid rate.")

    converted_amount = (amount * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return converted_amount, rate
