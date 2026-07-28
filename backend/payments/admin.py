from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("reference", "email", "amount", "currency", "status", "created_at")
    list_filter = ("status", "currency")
    search_fields = ("reference", "email")
    readonly_fields = ("reference", "receipt_sent_at", "created_at", "updated_at", "paystack_response")
