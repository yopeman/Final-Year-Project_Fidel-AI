from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment
from app.model.skill import Grade, Skill
from app.model.speaking_skill import SpeakingSkill

from seeds.common import SEED_COUNT

SEED_BATCH_PREFIX = "Seed Batch"


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


def _load_seeded_speaking_skills(db):
    return (
        db.query(SpeakingSkill)
        .join(Skill, SpeakingSkill.skill_id == Skill.id)
        .join(BatchEnrollment, Skill.enrollment_id == BatchEnrollment.id)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _grade_for_index(grades, index, offset=0):
    return grades[(index + offset) % len(grades)]


def seed_speaking_skills(db, skill_ids=None):
    """Seed 25 speaking skill assessments (one per seeded skill)."""
    existing = _load_seeded_speaking_skills(db)
    if len(existing) >= SEED_COUNT:
        return [ss.id for ss in existing]

    if skill_ids:
        skills = db.query(Skill).filter(Skill.id.in_(skill_ids[:SEED_COUNT])).all()
    else:
        skills = _load_seeded_skills(db)

    grades = list(Grade)
    existing_skill_ids = {ss.skill_id for ss in existing}
    speaking_to_add = []

    for i, skill in enumerate(skills[:SEED_COUNT]):
        if skill.id in existing_skill_ids:
            continue
        speaking_to_add.append(
            SpeakingSkill(
                skill_id=skill.id,
                pronunciation=_grade_for_index(grades, i, 0),
                fluency=_grade_for_index(grades, i, 1),
                grammar=_grade_for_index(grades, i, 2),
                vocabulary=_grade_for_index(grades, i, 3),
                coherence=_grade_for_index(grades, i, 4),
                final_result=_grade_for_index(grades, i, 5),
            )
        )

    if speaking_to_add:
        db.add_all(speaking_to_add)
        db.flush()

    return [ss.id for ss in _load_seeded_speaking_skills(db)]
