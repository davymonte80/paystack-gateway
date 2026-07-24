import uuid

from django.conf import settings
from django.core.management.base import BaseCommand

from payments.currencies import PAYSTACK_CURRENCIES
from payments.services import PaystackError, PaystackService


class Command(BaseCommand):
    help = "Test Paystack currency initialization payloads, optionally live against this merchant."

    def add_arguments(self, parser):
        parser.add_argument(
            "--all-supported",
            action="store_true",
            help="Test all Paystack-supported currencies instead of only PAYSTACK_ENABLED_CURRENCIES.",
        )
        parser.add_argument(
            "--live",
            action="store_true",
            help="Call Paystack /transaction/initialize. This creates payment initialization attempts.",
        )

    def handle(self, *args, **options):
        currencies = (
            list(PAYSTACK_CURRENCIES.keys())
            if options["all_supported"]
            else settings.PAYSTACK_ENABLED_CURRENCIES
        )
        service = PaystackService()

        self.stdout.write(
            "Testing currencies: "
            + ", ".join(currencies)
            + (" against Paystack" if options["live"] else " as a dry run")
        )

        failures = []
        for currency in currencies:
            amount = PAYSTACK_CURRENCIES[currency]["minimum_amount"]
            reference = f"CUR-{currency}-{uuid.uuid4().hex[:10].upper()}"

            if not options["live"]:
                payload = {
                    "email": settings.PAYSTACK_ANONYMOUS_EMAIL,
                    "amount": int(round(float(amount) * 100)),
                    "currency": currency,
                    "reference": reference,
                }
                self.stdout.write(self.style.SUCCESS(f"{currency}: OK dry-run payload {payload}"))
                continue

            try:
                result = service.initialize_transaction(
                    email=settings.PAYSTACK_ANONYMOUS_EMAIL,
                    amount=amount,
                    currency=currency,
                    reference=reference,
                    callback_url=settings.PAYSTACK_CALLBACK_URL,
                    metadata={"currency_smoke_test": True},
                )
            except PaystackError as exc:
                failures.append((currency, str(exc)))
                self.stdout.write(self.style.ERROR(f"{currency}: FAILED - {exc}"))
            else:
                authorization_url = result.get("data", {}).get("authorization_url", "")
                self.stdout.write(self.style.SUCCESS(f"{currency}: OK - {authorization_url}"))

        if failures:
            raise SystemExit(1)
