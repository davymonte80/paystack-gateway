import hashlib
import hmac
import json
import uuid

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .currencies import DISPLAY_CURRENCIES, PAYSTACK_CURRENCIES, serialize_currency
from .exchange_rates import ExchangeRateError, convert_to_charge_currency
from .models import Transaction
from .serializers import InitializePaymentSerializer, TransactionSerializer
from .services import PaystackError, PaystackService

paystack = PaystackService()


@api_view(["GET"])
def payment_currencies(request):
    """
    Return all Paystack-supported currencies plus the subset enabled for
    this merchant account. The frontend should only offer enabled currencies.
    """
    # These are display currencies only. All are converted and charged in KES,
    # so their availability does not depend on Paystack's merchant currency
    # activation setting.
    display_codes = list(DISPLAY_CURRENCIES.keys())
    supported_currencies = []
    for code in DISPLAY_CURRENCIES.keys():
        currency = serialize_currency(code, currencies=DISPLAY_CURRENCIES)
        currency["enabled"] = code in display_codes
        supported_currencies.append(currency)

    return Response(
        {
            "default_currency": settings.PAYSTACK_CHARGE_CURRENCY,
            "charge_currency": settings.PAYSTACK_CHARGE_CURRENCY,
            "enabled_currencies": [serialize_currency(code, currencies=DISPLAY_CURRENCIES) for code in display_codes],
            "supported_currencies": supported_currencies,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def initialize_payment(request):
    """
    Start a checkout: create a local Transaction record, ask Paystack
    for an authorization_url, and hand it back so the frontend can
    redirect the customer there to pay.
    """
    serializer = InitializePaymentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    reference = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    tipper_email = data.get("email", "")
    paystack_email = tipper_email or settings.PAYSTACK_ANONYMOUS_EMAIL

    display_currency = data.get("currency", settings.PAYSTACK_CHARGE_CURRENCY)
    try:
        charge_amount, exchange_rate = convert_to_charge_currency(data["amount"], display_currency)
    except ExchangeRateError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    minimum_charge_amount = PAYSTACK_CURRENCIES[settings.PAYSTACK_CHARGE_CURRENCY]["minimum_amount"]
    if charge_amount < minimum_charge_amount:
        return Response(
            {"amount": f"Converted payment must be at least KES {minimum_charge_amount}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    transaction = Transaction.objects.create(
        reference=reference,
        email=tipper_email,
        amount=charge_amount,
        currency=settings.PAYSTACK_CHARGE_CURRENCY,
        display_amount=data["amount"],
        display_currency=display_currency,
        exchange_rate=exchange_rate,
    )

    try:
        result = paystack.initialize_transaction(
            email=paystack_email,
            amount=transaction.amount,
            currency=transaction.currency,
            reference=reference,
            callback_url=settings.PAYSTACK_CALLBACK_URL,
            metadata={
                "transaction_id": transaction.id,
                "anonymous_tip": not bool(tipper_email),
                "provided_email": bool(tipper_email),
                "display_amount": str(transaction.display_amount),
                "display_currency": transaction.display_currency,
                "exchange_rate_to_kes": str(transaction.exchange_rate),
            },
        )
    except PaystackError as exc:
        transaction.status = Transaction.Status.FAILED
        transaction.save(update_fields=["status", "updated_at"])
        return Response(
            {"error": "Could not initialize payment", "detail": str(exc)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(
        {
            "authorization_url": result["data"]["authorization_url"],
            "access_code": result["data"]["access_code"],
            "reference": reference,
            "charge_amount": str(transaction.amount),
            "charge_currency": transaction.currency,
            "display_amount": str(transaction.display_amount),
            "display_currency": transaction.display_currency,
            "exchange_rate": str(transaction.exchange_rate),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def verify_payment(request, reference):
    """
    Ask Paystack for the real, authoritative status of a transaction.
    Always re-verify server-side — never trust a redirect URL alone.
    """
    try:
        transaction = Transaction.objects.get(reference=reference)
    except Transaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        result = paystack.verify_transaction(reference)
    except PaystackError as exc:
        return Response(
            {"error": "Could not verify payment", "detail": str(exc)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    paystack_status = result["data"]["status"]
    transaction.status = (
        Transaction.Status.SUCCESS if paystack_status == "success" else Transaction.Status.FAILED
    )
    transaction.paystack_response = result["data"]
    transaction.save(update_fields=["status", "paystack_response", "updated_at"])

    return Response(TransactionSerializer(transaction).data, status=status.HTTP_200_OK)


@csrf_exempt
@require_POST
def paystack_webhook(request):
    """
    Receive server-to-server payment events from Paystack.

    This is the source of truth for payment status in production —
    the customer's browser redirect can be closed, dropped, or
    tampered with, but Paystack will retry this webhook until it
    gets a 200 back.
    """
    signature = request.headers.get("x-paystack-signature", "")
    expected_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
        request.body,
        hashlib.sha512,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        return HttpResponse(status=401)

    event = json.loads(request.body)

    if event.get("event") == "charge.success":
        data = event["data"]
        reference = data.get("reference")
        Transaction.objects.filter(reference=reference).update(
            status=Transaction.Status.SUCCESS,
            paystack_response=data,
        )

    # Always return 200 so Paystack doesn't keep retrying a handled event.
    return HttpResponse(status=200)
