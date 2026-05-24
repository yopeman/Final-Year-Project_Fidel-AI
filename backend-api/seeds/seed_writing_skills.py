from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment
from app.model.skill import Skill
from app.model.writing_skill import WritingSkill

from seeds.common import SEED_COUNT
from seeds.skill_seed_helpers import SEED_BATCH_PREFIX, all_grades, grade_for_index, load_seeded_skills


def _load_seeded_writing_skills(db):
    return (
        db.query(WritingSkill)
        .join(Skill, WritingSkill.skill_id == Skill.id)
        .join(BatchEnrollment, Skill.enrollment_id == BatchEnrollment.id)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_writing_skills(db, skill_ids=None):
    """Seed 25 writing skill assessments (one per seeded skill)."""
    existing = _load_seeded_writing_skills(db)
    if len(existing) >= SEED_COUNT:
        return [ws.id for ws in existing]

    skills = (
        db.query(Skill).filter(Skill.id.in_(skill_ids[:SEED_COUNT])).all()
        if skill_ids
        else load_seeded_skills(db)
    )

    grades = all_grades()
    existing_skill_ids = {ws.skill_id for ws in existing}
    writing_to_add = []

    for i, skill in enumerate(skills[:SEED_COUNT]):
        if skill.id in existing_skill_ids:
            continue
        writing_to_add.append(
            WritingSkill(
                skill_id=skill.id,
                coherence=grade_for_index(grades, i, 0),
                grammar=grade_for_index(grades, i, 1),
                vocabulary=grade_for_index(grades, i, 2),
                punctuation=grade_for_index(grades, i, 3),
                final_result=grade_for_index(grades, i, 4),
            )
        )

    if writing_to_add:
        db.add_all(writing_to_add)
        db.flush()

    return [ws.id for ws in _load_seeded_writing_skills(db)]
