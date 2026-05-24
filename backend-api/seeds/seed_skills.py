from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment
from app.model.skill import Grade, Skill
from app.model.user import User, UserRole

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN

SEED_BATCH_PREFIX = "Seed Batch"


def _load_seeded_enrollments(db):
    return (
        db.query(BatchEnrollment)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_skills(db):
    return (
        db.query(Skill)
        .join(BatchEnrollment, Skill.enrollment_id == BatchEnrollment.id)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _load_tutor_users(db):
    return (
        db.query(User)
        .filter(
            User.email.like(f"seed.tutor%@{SEED_EMAIL_DOMAIN}"),
            User.role == UserRole.tutor,
        )
        .order_by(User.email)
        .all()
    )


def seed_skills(db, enrollment_ids=None, _user_ids=None):
    """Seed 25 skills (one per seeded batch enrollment)."""
    existing = _load_seeded_skills(db)
    if len(existing) >= SEED_COUNT:
        return [s.id for s in existing]

    enrollments = (
        _load_seeded_enrollments(db)
        if not enrollment_ids
        else db.query(BatchEnrollment)
        .filter(BatchEnrollment.id.in_(enrollment_ids[:SEED_COUNT]))
        .all()
    )

    tutors = _load_tutor_users(db)
    if not tutors:
        raise ValueError("No seed tutors found. Run seed_users first.")

    grades = list(Grade)
    existing_enrollment_ids = {s.enrollment_id for s in existing}
    skills_to_add = []

    for i, enrollment in enumerate(enrollments[:SEED_COUNT]):
        if enrollment.id in existing_enrollment_ids:
            continue
        skills_to_add.append(
            Skill(
                enrollment_id=enrollment.id,
                instructor_id=tutors[i % len(tutors)].id,
                final_result=grades[i % len(grades)],
            )
        )

    if skills_to_add:
        db.add_all(skills_to_add)
        db.flush()

    return [s.id for s in _load_seeded_skills(db)]
