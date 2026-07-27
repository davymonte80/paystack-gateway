# Generated manually for the multi-currency KES charging flow.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("payments", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="display_amount",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name="transaction",
            name="display_currency",
            field=models.CharField(blank=True, max_length=3),
        ),
        migrations.AddField(
            model_name="transaction",
            name="exchange_rate",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=16, null=True),
        ),
    ]
