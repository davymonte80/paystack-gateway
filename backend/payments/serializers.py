from django.conf import settings
from rest_framework import serializers

from .currencies import PAYSTACK_CURRENCIES, normalize_currency_codes
from .models import Transaction

SUPPORTED_CURRENCIES = list(PAYSTACK_CURRENCIES.keys())


class InitializePaymentSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1)
    currency = serializers.ChoiceField(choices=SUPPORTED_CURRENCIES, required=False, default=settings.PAYSTACK_DEFAULT_CURRENCY)

    def validate_email(self, value):
        return value.strip()

    def validate(self, attrs):
        enabled_currencies = normalize_currency_codes(settings.PAYSTACK_ENABLED_CURRENCIES)
        currency = attrs.get("currency", settings.PAYSTACK_DEFAULT_CURRENCY)
        amount = attrs["amount"]
        minimum_amount = PAYSTACK_CURRENCIES[currency]["minimum_amount"]

        if currency not in enabled_currencies:
            raise serializers.ValidationError(
                {
                    "currency": (
                        f"{currency} is supported by Paystack, but it is not enabled for this merchant. "
                        "Update PAYSTACK_ENABLED_CURRENCIES only after Paystack activates it for your business."
                    )
                }
            )

        if amount < minimum_amount:
            raise serializers.ValidationError(
                {"amount": f"Minimum amount for {currency} is {currency} {minimum_amount}."}
            )

        return attrs


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["reference", "email", "amount", "currency", "status", "created_at", "updated_at"]
        read_only_fields = fields
