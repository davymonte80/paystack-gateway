# Generated manually because this project keeps migrations under version control.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0002_transaction_display_amount_transaction_display_currency_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="receipt_sent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
