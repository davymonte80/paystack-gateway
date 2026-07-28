"""
Django settings for the payment gateway project.

All secrets (Django SECRET_KEY, Paystack keys, allowed origins) are read
from a .env file via django-environ — never hardcode them here.
"""

from pathlib import Path
import environ

from payments.currencies import DISPLAY_CURRENCIES, PAYSTACK_CURRENCIES, normalize_currency_codes

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)
# Reads backend/.env
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", "buymeespresso-api.onrender.com"],
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "payments",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# --- CORS ---
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:5173", "https://buymeespresso.vercel.app"],
)

# --- Email receipts ---
# Use Django's console backend locally. Configure SMTP variables in Render to
# deliver receipts in production.
EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_TIMEOUT = env.int("EMAIL_TIMEOUT", default=15)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="receipts@buymeespresso.com")

# --- Paystack ---
PAYSTACK_SECRET_KEY = env("PAYSTACK_SECRET_KEY")
PAYSTACK_PUBLIC_KEY = env("PAYSTACK_PUBLIC_KEY")
PAYSTACK_CALLBACK_URL = env("PAYSTACK_CALLBACK_URL", default="http://localhost:5173/payment/callback")
PAYSTACK_ANONYMOUS_EMAIL = env("PAYSTACK_ANONYMOUS_EMAIL", default="anonymous@example.com")
PAYSTACK_ENABLED_CURRENCIES = normalize_currency_codes(env.list("PAYSTACK_ENABLED_CURRENCIES", default=["KES"])) or ["KES"]
PAYSTACK_DEFAULT_CURRENCY = env("PAYSTACK_DEFAULT_CURRENCY", default=PAYSTACK_ENABLED_CURRENCIES[0]).strip().upper()
if PAYSTACK_DEFAULT_CURRENCY not in PAYSTACK_ENABLED_CURRENCIES:
    PAYSTACK_DEFAULT_CURRENCY = PAYSTACK_ENABLED_CURRENCIES[0]

# Customers may select any of these currencies for the amount they see. Every
# payment is then converted server-side and charged to Paystack in KES.
PAYSTACK_CHARGE_CURRENCY = "KES"
PAYSTACK_DISPLAY_CURRENCIES = normalize_currency_codes(
    env.list("PAYSTACK_DISPLAY_CURRENCIES", default=list(DISPLAY_CURRENCIES.keys())),
    currencies=DISPLAY_CURRENCIES,
) or [PAYSTACK_CHARGE_CURRENCY]
if PAYSTACK_CHARGE_CURRENCY not in PAYSTACK_DISPLAY_CURRENCIES:
    PAYSTACK_DISPLAY_CURRENCIES.insert(0, PAYSTACK_CHARGE_CURRENCY)
PAYSTACK_EXCHANGE_RATE_URL = env(
    "PAYSTACK_EXCHANGE_RATE_URL",
    default="https://api.frankfurter.dev/v2/rate/{base}/{quote}",
)
