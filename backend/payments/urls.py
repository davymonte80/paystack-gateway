from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    path("initialize/", views.initialize_payment, name="initialize-payment"),
    path("verify/<str:reference>/", views.verify_payment, name="verify-payment"),
    path("webhook/", views.paystack_webhook, name="paystack-webhook"),
]
