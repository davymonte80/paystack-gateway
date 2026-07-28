import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction as db_transaction
from django.utils import timezone

from .models import Transaction

logger = logging.getLogger(__name__)


def _format_amount(amount):
    return f"{amount:,.2f}"


def send_success_receipt(reference, paystack_response):
    """Record a successful payment and send one receipt when an email was supplied."""
    with db_transaction.atomic():
        transaction = Transaction.objects.select_for_update().filter(reference=reference).first()
        if transaction is None:
            return

        transaction.status = Transaction.Status.SUCCESS
        transaction.paystack_response = paystack_response
        transaction.save(update_fields=["status", "paystack_response", "updated_at"])

        # Anonymous contributors do not receive a receipt. The database flag
        # prevents the Paystack webhook and browser callback from sending two.
        if not transaction.email or transaction.receipt_sent_at:
            return

        display_amount = transaction.display_amount or transaction.amount
        display_currency = transaction.display_currency or transaction.currency
        charged_amount = _format_amount(transaction.amount)
        contributed_amount = _format_amount(display_amount)
        charged_line = ""
        if (
            display_currency != transaction.currency
            or display_amount != transaction.amount
        ):
            charged_line = (
                f"\nAmount charged: {transaction.currency} {charged_amount}\n"
            )

        try:
            send_mail(
                subject="Your Buy Me Espresso receipt",
                message=(
                    "Thank you for your contribution!\n\n"
                    f"Contribution: {display_currency} {contributed_amount}\n"
                    f"Reference: {transaction.reference}\n"
                    f"Status: Successful\n"
                    f"{charged_line}\n"
                    "Your payment was confirmed by Paystack."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[transaction.email],
                fail_silently=False,
            )
        except Exception:
            # Do not turn a confirmed Paystack payment into a failed request.
            # Leaving receipt_sent_at empty allows a later verification to retry.
            logger.exception("Could not send receipt for payment %s", transaction.reference)
            return

        transaction.receipt_sent_at = timezone.now()
        transaction.save(update_fields=["receipt_sent_at", "updated_at"])
