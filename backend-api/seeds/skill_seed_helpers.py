"""Shared helpers for skill sub-type seed scripts."""

from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment
from app.model.skill import Grade, Skill

from seeds.common import SEED_COUNT

SEED_BATCH_PREFIX = "Seed Batch"


def load_seeded_skills(db):
    return (
        db.query(Skill)
        .join(BatchEnrollment, Skill.enrollment_id == BatchEnrollment.id)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def grade_for_index(grades, index, offset=0):
    return grades[(index + offset) % len(grades)]


def all_grades():
    return list(Grade)
