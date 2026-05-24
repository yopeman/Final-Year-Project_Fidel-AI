from datetime import datetime, timedelta, timezone

from app.model.user import User
from app.model.verification_code import VerificationCode

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN


def seed_verification_codes(db, user_ids=None):
    """Seed 25 verification codes linked to seeded users."""
    existing = (
        db.query(VerificationCode)
        .join(User, VerificationCode.user_id == User.id)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .count()
    )
    if existing >= SEED_COUNT:
        return [
            c.id
            for c in (
                db.query(VerificationCode)
                .join(User, VerificationCode.user_id == User.id)
                .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
                .order_by(VerificationCode.email)
                .limit(SEED_COUNT)
                .all()
            )
        ]

    users = (
        db.query(User)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )
    seeded_emails = {
        c.email
        for c in db.query(VerificationCode)
        .filter(VerificationCode.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .all()
    }
    users = [u for u in users if u.email not in seeded_emails]

    now = datetime.now(timezone.utc)
    codes = []
    for i, user in enumerate(users[:SEED_COUNT]):
        codes.append(
            VerificationCode(
                email=user.email,
                code=f"{100000 + i:06d}",
                expires_at=now + timedelta(hours=24 + i),
                is_used=1 if i % 5 == 0 else 0,
                user_id=user.id,
            )
        )

    if codes:
        db.add_all(codes)
        db.flush()
    return [
        c.id
        for c in (
            db.query(VerificationCode)
            .filter(VerificationCode.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
            .order_by(VerificationCode.email)
            .limit(SEED_COUNT)
            .all()
        )
    ]
