import logging
from io import BytesIO

from django.conf import settings
from django.core.mail import EmailMessage
from django.db import transaction as db_transaction
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from .models import Transaction

logger = logging.getLogger(__name__)


def _format_amount(amount):
    return f"{amount:,.2f}"


def build_receipt_pdf(transaction):
    """Build a compact PDF receipt for a confirmed contribution."""
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    page_width, page_height = A4

    pdf.setFillColor(colors.HexColor("#5b3425"))
    pdf.rect(0, page_height - 105, page_width, 105, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(48, page_height - 58, "Buy Me Espresso")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(48, page_height - 80, "Payment receipt")

    display_amount = transaction.display_amount or transaction.amount
    display_currency = transaction.display_currency or transaction.currency
    rows = [
        ("Status", "Successful"),
        ("Contribution", f"{display_currency} {_format_amount(display_amount)}"),
        ("Reference", transaction.reference),
        ("Date", transaction.created_at.strftime("%d %B %Y, %H:%M UTC")),
    ]
    if display_currency != transaction.currency or display_amount != transaction.amount:
        rows.insert(2, ("Amount charged", f"{transaction.currency} {_format_amount(transaction.amount)}"))

    y = page_height - 150
    for label, value in rows:
        pdf.setFillColor(colors.HexColor("#6d625c"))
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(48, y, label.upper())
        pdf.setFillColor(colors.HexColor("#231f20"))
        pdf.setFont("Helvetica", 12)
        pdf.drawString(185, y, value)
        pdf.setStrokeColor(colors.HexColor("#e7dfd8"))
        pdf.line(48, y - 14, page_width - 48, y - 14)
        y -= 42

    pdf.setFillColor(colors.HexColor("#6d625c"))
    pdf.setFont("Helvetica", 10)
    pdf.drawString(48, 75, "Thank you for supporting Buy Me Espresso.")
    pdf.save()
    buffer.seek(0)
    return buffer.read()


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

        try:
            message = EmailMessage(
                subject="Your Buy Me Espresso receipt",
                message=(
                    "Thank you for your contribution!\n\n"
                    "Your payment was confirmed by Paystack. Your PDF receipt "
                    "is attached to this email.\n\n"
                    f"Reference: {transaction.reference}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[transaction.email],
            )
            message.attach(
                f"buy-me-espresso-receipt-{transaction.reference}.pdf",
                build_receipt_pdf(transaction),
                "application/pdf",
            )
            message.send(fail_silently=False)
        except Exception:
            # Do not turn a confirmed Paystack payment into a failed request.
            # Leaving receipt_sent_at empty allows a later verification to retry.
            logger.exception("Could not send receipt for payment %s", transaction.reference)
            return

        transaction.receipt_sent_at = timezone.now()
        transaction.save(update_fields=["receipt_sent_at", "updated_at"])
