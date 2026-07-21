from rest_framework import serializers

from .models import Transaction


class InitializePaymentSerializer(serializers.Serializer):
    email = serializers.EmailField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1)
    currency = serializers.CharField(max_length=3, required=False, default="KES")


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["reference", "email", "amount", "currency", "status", "created_at", "updated_at"]
        read_only_fields = fields
