"""Shared constants and helpers for database seeds."""

SEED_COUNT = 25
SEED_EMAIL_DOMAIN = "fidel.seed.local"
DEFAULT_PASSWORD = "12345678"


def seed_email(role: str, index: int) -> str:
    return f"seed.{role}{index:02d}@{SEED_EMAIL_DOMAIN}"
