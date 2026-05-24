from app.model.batch import Batch
from app.model.batch_course import BatchCourse
from app.model.batch_instructor import BatchInstructor, InstructorRole
from app.model.user import User, UserRole

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN

SEED_BATCH_PREFIX = "Seed Batch"


def _load_seeded_batch_courses(db):
    return (
        db.query(BatchCourse)
        .join(Batch, BatchCourse.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_instructors(db):
    return (
        db.query(BatchInstructor)
        .join(BatchCourse, BatchInstructor.batch_course_id == BatchCourse.id)
        .join(Batch, BatchCourse.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name, BatchInstructor.role)
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


def seed_batch_instructors(db, user_ids=None, batch_course_ids=None):
    """Seed 25 batch instructors (tutors assigned to seeded batch courses)."""
    existing = _load_seeded_instructors(db)
    if len(existing) >= SEED_COUNT:
        return [bi.id for bi in existing]

    tutors = _load_tutor_users(db)
    if not tutors:
        raise ValueError(
            "No seed tutors found. Run seed_users first (expects seed.tutor01–03)."
        )

    if batch_course_ids:
        batch_courses = (
            db.query(BatchCourse)
            .filter(BatchCourse.id.in_(batch_course_ids[:SEED_COUNT]))
            .all()
        )
    else:
        batch_courses = _load_seeded_batch_courses(db)

    existing_batch_course_ids = {bi.batch_course_id for bi in existing}
    instructors_to_add = []
    for i, batch_course in enumerate(batch_courses[:SEED_COUNT]):
        if batch_course.id in existing_batch_course_ids:
            continue
        tutor = tutors[i % len(tutors)]
        role = InstructorRole.main if i % 2 == 0 else InstructorRole.assistant
        instructors_to_add.append(
            BatchInstructor(
                user_id=tutor.id,
                batch_course_id=batch_course.id,
                role=role,
            )
        )

    if instructors_to_add:
        db.add_all(instructors_to_add)
        db.flush()

    return [bi.id for bi in _load_seeded_instructors(db)]
