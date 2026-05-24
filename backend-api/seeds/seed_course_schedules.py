from app.model.batch import Batch
from app.model.batch_course import BatchCourse
from app.model.course_schedule import CourseSchedule
from app.model.schedule import Schedule

from seeds.common import SEED_COUNT
from seeds.seed_schedules import _load_seeded_schedules

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


def _load_seeded_course_schedules(db):
    return (
        db.query(CourseSchedule)
        .join(BatchCourse, CourseSchedule.batch_course_id == BatchCourse.id)
        .join(Batch, BatchCourse.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_course_schedules(db, schedule_ids=None, batch_course_ids=None):
    """Seed 25 course schedules (one per seeded batch course)."""
    existing = _load_seeded_course_schedules(db)
    if len(existing) >= SEED_COUNT:
        return [cs.id for cs in existing]

    schedules = _load_seeded_schedules(db)
    if schedule_ids:
        schedules = (
            db.query(Schedule)
            .filter(Schedule.id.in_(schedule_ids[:SEED_COUNT]))
            .all()
        )
    if not schedules:
        raise ValueError("No seeded schedules found. Run seed_schedules first.")

    if batch_course_ids:
        batch_courses = (
            db.query(BatchCourse)
            .filter(BatchCourse.id.in_(batch_course_ids[:SEED_COUNT]))
            .all()
        )
    else:
        batch_courses = _load_seeded_batch_courses(db)

    existing_batch_course_ids = {cs.batch_course_id for cs in existing}
    course_schedules_to_add = []
    for i, batch_course in enumerate(batch_courses[:SEED_COUNT]):
        if batch_course.id in existing_batch_course_ids:
            continue
        course_schedules_to_add.append(
            CourseSchedule(
                schedule_id=schedules[i % len(schedules)].id,
                batch_course_id=batch_course.id,
            )
        )

    if course_schedules_to_add:
        db.add_all(course_schedules_to_add)
        db.flush()

    return [cs.id for cs in _load_seeded_course_schedules(db)]
