from datetime import time

from app.model.schedule import DayOfWeek, Schedule

from seeds.common import SEED_COUNT


def _seed_schedule_slots():
    """Deterministic 25 (day, start, end) slots for idempotent seeding."""
    days = list(DayOfWeek)
    slots = []
    for i in range(SEED_COUNT):
        day = days[i % len(days)]
        start_hour = 9 + (i % 8)
        minute = (i * 11) % 60
        start = time(start_hour, minute)
        end = time(min(start_hour + 1, 21), minute)
        slots.append((day, start, end))
    return slots


def _load_seeded_schedules(db):
    slots = _seed_schedule_slots()
    schedules = []
    for day, start, end in slots:
        row = (
            db.query(Schedule)
            .filter(
                Schedule.day_of_week == day,
                Schedule.start_time == start,
                Schedule.end_time == end,
            )
            .first()
        )
        if row:
            schedules.append(row)
    return schedules


def seed_schedules(db, *_args):
    """Seed 25 weekly class schedules."""
    existing = _load_seeded_schedules(db)
    if len(existing) >= SEED_COUNT:
        return [s.id for s in existing]

    existing_slots = {(s.day_of_week, s.start_time, s.end_time) for s in existing}
    schedules_to_add = []
    for day, start, end in _seed_schedule_slots():
        if (day, start, end) in existing_slots:
            continue
        schedules_to_add.append(
            Schedule(day_of_week=day, start_time=start, end_time=end)
        )

    if schedules_to_add:
        db.add_all(schedules_to_add)
        db.flush()

    return [s.id for s in _load_seeded_schedules(db)]
