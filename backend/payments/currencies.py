from decimal import Decimal


PAYSTACK_CURRENCIES = {
    "NGN": {
        "name": "Nigerian Naira",
        "minimum_amount": Decimal("50"),
        "presets": [2500, 7500, 12500],
        "availability": "Nigeria",
    },
    "USD": {
        "name": "US Dollar",
        "minimum_amount": Decimal("2"),
        "presets": [3, 9, 15],
        "availability": "Kenya and Nigeria, when enabled by Paystack",
    },
    "GHS": {
        "name": "Ghanaian Cedi",
        "minimum_amount": Decimal("0.1"),
        "presets": [30, 90, 150],
        "availability": "Ghana",
    },
    "ZAR": {
        "name": "South African Rand",
        "minimum_amount": Decimal("1"),
        "presets": [50, 150, 250],
        "availability": "South Africa",
    },
    "KES": {
        "name": "Kenyan Shilling",
        "minimum_amount": Decimal("3"),
        "presets": [250, 750, 1250],
        "availability": "Kenya",
    },
    "XOF": {
        "name": "West African CFA Franc",
        "minimum_amount": Decimal("1"),
        "presets": [1000, 3000, 5000],
        "availability": "Côte d’Ivoire",
    },
}


def normalize_currency_codes(codes):
    normalized_codes = []
    for code in codes:
        normalized_code = str(code).strip().upper()
        if normalized_code in PAYSTACK_CURRENCIES and normalized_code not in normalized_codes:
            normalized_codes.append(normalized_code)
    return normalized_codes


def serialize_currency(code):
    currency = PAYSTACK_CURRENCIES[code]
    return {
        "code": code,
        "name": currency["name"],
        "minimum_amount": str(currency["minimum_amount"]),
        "presets": currency["presets"],
        "availability": currency["availability"],
    }
