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


# These currencies are display-only: the backend converts them to KES before
# creating a Paystack transaction. They must not be added to
# PAYSTACK_ENABLED_CURRENCIES unless Paystack has activated them for the
# merchant account.
DISPLAY_CURRENCIES = {
    **PAYSTACK_CURRENCIES,
    "AED": {"name": "United Arab Emirates Dirham", "minimum_amount": Decimal("1"), "presets": [10, 30, 50], "availability": "United Arab Emirates"},
    "AUD": {"name": "Australian Dollar", "minimum_amount": Decimal("1"), "presets": [5, 15, 25], "availability": "Australia"},
    "BRL": {"name": "Brazilian Real", "minimum_amount": Decimal("1"), "presets": [10, 30, 50], "availability": "Brazil"},
    "CAD": {"name": "Canadian Dollar", "minimum_amount": Decimal("1"), "presets": [5, 15, 25], "availability": "Canada"},
    "CHF": {"name": "Swiss Franc", "minimum_amount": Decimal("1"), "presets": [3, 9, 15], "availability": "Switzerland"},
    "CNY": {"name": "Chinese Yuan", "minimum_amount": Decimal("1"), "presets": [20, 60, 100], "availability": "China"},
    "DKK": {"name": "Danish Krone", "minimum_amount": Decimal("1"), "presets": [20, 60, 100], "availability": "Denmark"},
    "EUR": {"name": "Euro", "minimum_amount": Decimal("1"), "presets": [3, 9, 15], "availability": "Eurozone"},
    "GBP": {"name": "British Pound", "minimum_amount": Decimal("1"), "presets": [3, 9, 15], "availability": "United Kingdom"},
    "HKD": {"name": "Hong Kong Dollar", "minimum_amount": Decimal("1"), "presets": [20, 60, 100], "availability": "Hong Kong"},
    "INR": {"name": "Indian Rupee", "minimum_amount": Decimal("1"), "presets": [100, 300, 500], "availability": "India"},
    "JPY": {"name": "Japanese Yen", "minimum_amount": Decimal("1"), "presets": [500, 1500, 2500], "availability": "Japan"},
    "MXN": {"name": "Mexican Peso", "minimum_amount": Decimal("1"), "presets": [50, 150, 250], "availability": "Mexico"},
    "NOK": {"name": "Norwegian Krone", "minimum_amount": Decimal("1"), "presets": [30, 90, 150], "availability": "Norway"},
    "NZD": {"name": "New Zealand Dollar", "minimum_amount": Decimal("1"), "presets": [5, 15, 25], "availability": "New Zealand"},
    "SEK": {"name": "Swedish Krona", "minimum_amount": Decimal("1"), "presets": [30, 90, 150], "availability": "Sweden"},
    "SGD": {"name": "Singapore Dollar", "minimum_amount": Decimal("1"), "presets": [5, 15, 25], "availability": "Singapore"},
}


def normalize_currency_codes(codes, currencies=PAYSTACK_CURRENCIES):
    normalized_codes = []
    for code in codes:
        normalized_code = str(code).strip().upper()
        if normalized_code in currencies and normalized_code not in normalized_codes:
            normalized_codes.append(normalized_code)
    return normalized_codes


def serialize_currency(code, currencies=PAYSTACK_CURRENCIES):
    currency = currencies[code]
    return {
        "code": code,
        "name": currency["name"],
        "minimum_amount": str(currency["minimum_amount"]),
        "presets": currency["presets"],
        "availability": currency["availability"],
    }
