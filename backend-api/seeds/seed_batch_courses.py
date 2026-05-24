from app.model.batch import Batch
from app.model.batch_course import BatchCourse
from app.model.course import Course

from seeds.common import SEED_COUNT

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


def seed_batch_courses(db, batch_ids=None, course_ids=None):
    """Seed 25 batch–course links (one course per seeded batch)."""
    existing = _load_seeded_batch_courses(db)
    if len(existing) >= SEED_COUNT:
        return [bc.id for bc in existing]

    if not batch_ids:
        batch_ids = [
            b.id
            for b in (
                db.query(Batch)
                .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
                .order_by(Batch.name)
                .limit(SEED_COUNT)
                .all()
            )
        ]
    if not course_ids:
        course_ids = [
            c.id
            for c in (
                db.query(Course)
                .filter(Course.name.like("Seed Course%"))
                .order_by(Course.name)
                .limit(SEED_COUNT)
                .all()
            )
        ]

    existing_batch_ids = {bc.batch_id for bc in existing}
    pairs = [
        (batch_ids[i], course_ids[i])
        for i in range(min(SEED_COUNT, len(batch_ids), len(course_ids)))
        if batch_ids[i] not in existing_batch_ids
    ]

    batch_courses_to_add = [
        BatchCourse(batch_id=batch_id, course_id=course_id)
        for batch_id, course_id in pairs
    ]
    if batch_courses_to_add:
        db.add_all(batch_courses_to_add)
        db.flush()

    return [bc.id for bc in _load_seeded_batch_courses(db)]
