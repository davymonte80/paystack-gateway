from django.conf import settings
from rest_framework import serializers

from .currencies import DISPLAY_CURRENCIES, PAYSTACK_CURRENCIES
from .models import Transaction

SUPPORTED_CURRENCIES = list(DISPLAY_CURRENCIES.keys())


class InitializePaymentSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1)
    currency = serializers.ChoiceField(choices=SUPPORTED_CURRENCIES, required=False, default=settings.PAYSTACK_DEFAULT_CURRENCY)

    def validate_email(self, value):
        return value.strip()

    def validate(self, attrs):
        currency = attrs.get("currency", settings.PAYSTACK_DEFAULT_CURRENCY)
        amount = attrs["amount"]
        minimum_amount = DISPLAY_CURRENCIES[currency]["minimum_amount"]

        if currency not in DISPLAY_CURRENCIES:
            raise serializers.ValidationError(
                {
                    "currency": (
                        f"{currency} is not available for display."
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
        fields = [
            "reference", "email", "amount", "currency", "display_amount",
            "display_currency", "exchange_rate", "status", "created_at", "updated_at",
        ]
        read_only_fields = fields
