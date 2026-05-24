from datetime import date, timedelta

from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment, EnrollmentStatus
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN

SEED_BATCH_PREFIX = "Seed Batch"


def _load_seeded_profiles(db):
    return (
        db.query(StudentProfile)
        .join(User, StudentProfile.user_id == User.id)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_batches(db):
    return (
        db.query(Batch)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_enrollments(db):
    return (
        db.query(BatchEnrollment)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_batch_enrollments(db, profile_ids=None, batch_ids=None):
    """Seed 25 batch enrollments (one student profile per seeded batch)."""
    existing = _load_seeded_enrollments(db)
    if len(existing) >= SEED_COUNT:
        return [e.id for e in existing]

    profiles = _load_seeded_profiles(db)
    if profile_ids:
        profiles = (
            db.query(StudentProfile)
            .join(User, StudentProfile.user_id == User.id)
            .filter(StudentProfile.id.in_(profile_ids[:SEED_COUNT]))
            .order_by(User.email)
            .all()
        )

    batches = _load_seeded_batches(db)
    if batch_ids:
        batches = (
            db.query(Batch)
            .filter(Batch.id.in_(batch_ids[:SEED_COUNT]))
            .order_by(Batch.name)
            .all()
        )

    existing_batch_ids = {e.batch_id for e in existing}
    statuses = list(EnrollmentStatus)
    today = date.today()
    enrollments_to_add = []

    for i in range(min(SEED_COUNT, len(profiles), len(batches))):
        batch = batches[i]
        if batch.id in existing_batch_ids:
            continue
        status = statuses[i % len(statuses)]
        enrolled_on = today - timedelta(days=30 + i)
        enrollments_to_add.append(
            BatchEnrollment(
                profile_id=profiles[i].id,
                batch_id=batch.id,
                enrollment_date=enrolled_on,
                completion_date=(
                    enrolled_on + timedelta(days=60) if status == EnrollmentStatus.completed else None
                ),
                status=status,
            )
        )

    if enrollments_to_add:
        db.add_all(enrollments_to_add)
        db.flush()

    return [e.id for e in _load_seeded_enrollments(db)]
