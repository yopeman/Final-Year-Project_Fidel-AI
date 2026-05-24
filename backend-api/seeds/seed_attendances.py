from datetime import date, timedelta

from app.model.attendance import Attendance, AttendanceStatus, UserType
from app.model.course_schedule import CourseSchedule
from app.model.user import User, UserRole

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN

SEED_BATCH_PREFIX = "Seed Batch"


def _load_seeded_course_schedules(db):
    from app.model.batch import Batch
    from app.model.batch_course import BatchCourse

    return (
        db.query(CourseSchedule)
        .join(BatchCourse, CourseSchedule.batch_course_id == BatchCourse.id)
        .join(Batch, BatchCourse.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_users(db):
    return (
        db.query(User)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_attendances(db):
    from app.model.batch import Batch
    from app.model.batch_course import BatchCourse

    return (
        db.query(Attendance)
        .join(CourseSchedule, Attendance.course_schedule_id == CourseSchedule.id)
        .join(BatchCourse, CourseSchedule.batch_course_id == BatchCourse.id)
        .join(Batch, BatchCourse.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _user_type_for_role(role: UserRole) -> UserType:
    if role == UserRole.tutor:
        return UserType.tutor
    return UserType.student


def seed_attendances(db, course_schedule_ids=None, user_ids=None):
    """Seed 25 attendance records (one per seeded course schedule)."""
    existing = _load_seeded_attendances(db)
    if len(existing) >= SEED_COUNT:
        return [a.id for a in existing]

    course_schedules = _load_seeded_course_schedules(db)
    if course_schedule_ids:
        course_schedules = (
            db.query(CourseSchedule)
            .filter(CourseSchedule.id.in_(course_schedule_ids[:SEED_COUNT]))
            .all()
        )

    users = _load_seeded_users(db)
    if user_ids and user_ids.get("all"):
        users = (
            db.query(User)
            .filter(User.id.in_(user_ids["all"][:SEED_COUNT]))
            .order_by(User.email)
            .all()
        )

    statuses = list(AttendanceStatus)
    today = date.today()
    existing_schedule_ids = {a.course_schedule_id for a in existing}
    attendances_to_add = []

    for i, course_schedule in enumerate(course_schedules[:SEED_COUNT]):
        if course_schedule.id in existing_schedule_ids:
            continue
        user = users[i % len(users)]
        attendances_to_add.append(
            Attendance(
                course_schedule_id=course_schedule.id,
                user_id=user.id,
                user_type=_user_type_for_role(user.role),
                status=statuses[i % len(statuses)],
                attendance_date=today - timedelta(days=i % 14),
            )
        )

    if attendances_to_add:
        db.add_all(attendances_to_add)
        db.flush()

    return [a.id for a in _load_seeded_attendances(db)]
