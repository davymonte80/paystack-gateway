from django.db import models


class Transaction(models.Model):
    """A local record of a payment attempt, kept in sync with Paystack."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    reference = models.CharField(max_length=100, unique=True, editable=False)
    email = models.EmailField()
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Amount in the main currency unit, e.g. KES")
    currency = models.CharField(max_length=3, default="KES")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    paystack_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} ({self.status})"
