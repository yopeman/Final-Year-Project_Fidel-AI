from datetime import datetime, timedelta, timezone

from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment
from app.model.payment import Payment, PaymentStatus

from seeds.common import SEED_COUNT

SEED_BATCH_PREFIX = "Seed Batch"
SEED_TXN_PREFIX = "seed-txn"


def _load_seeded_enrollments(db):
    return (
        db.query(BatchEnrollment)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_payments(db):
    return (
        db.query(Payment)
        .filter(Payment.transaction_id.like(f"{SEED_TXN_PREFIX}%"))
        .order_by(Payment.transaction_id)
        .limit(SEED_COUNT)
        .all()
    )


def seed_payments(db, enrollment_ids=None):
    """Seed 25 payments (one per seeded batch enrollment)."""
    existing = _load_seeded_payments(db)
    if len(existing) >= SEED_COUNT:
        return [p.id for p in existing]

    if enrollment_ids:
        enrollments = (
            db.query(BatchEnrollment)
            .filter(BatchEnrollment.id.in_(enrollment_ids[:SEED_COUNT]))
            .all()
        )
    else:
        enrollments = _load_seeded_enrollments(db)

    existing_enrollment_ids = {p.enrollment_id for p in existing}
    statuses = list(PaymentStatus)
    methods = ["card", "bank_transfer", "mobile_wallet", "paypal", "cash"]
    now = datetime.now(timezone.utc)
    payments_to_add = []

    for i, enrollment in enumerate(enrollments[:SEED_COUNT]):
        if enrollment.id in existing_enrollment_ids:
            continue
        status = statuses[i % len(statuses)]
        payments_to_add.append(
            Payment(
                enrollment_id=enrollment.id,
                amount=199.0 + (i * 25),
                currency="USD",
                method=methods[i % len(methods)],
                status=status,
                paid_at=now - timedelta(days=i) if status == PaymentStatus.completed else None,
                transaction_id=f"{SEED_TXN_PREFIX}-{i + 1:03d}",
                checkout_url=f"https://pay.fidel.seed/checkout/{i + 1:03d}",
                receipt_url=(
                    f"https://pay.fidel.seed/receipt/{i + 1:03d}"
                    if status == PaymentStatus.completed
                    else None
                ),
            )
        )

    if payments_to_add:
        db.add_all(payments_to_add)
        db.flush()

    return [p.id for p in _load_seeded_payments(db)]
