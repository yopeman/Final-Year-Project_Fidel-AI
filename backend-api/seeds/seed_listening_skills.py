from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment
from app.model.listening_skill import ListeningSkill
from app.model.skill import Skill

from seeds.common import SEED_COUNT
from seeds.skill_seed_helpers import SEED_BATCH_PREFIX, all_grades, grade_for_index, load_seeded_skills


def _load_seeded_listening_skills(db):
    return (
        db.query(ListeningSkill)
        .join(Skill, ListeningSkill.skill_id == Skill.id)
        .join(BatchEnrollment, Skill.enrollment_id == BatchEnrollment.id)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_listening_skills(db, skill_ids=None):
    """Seed 25 listening skill assessments (one per seeded skill)."""
    existing = _load_seeded_listening_skills(db)
    if len(existing) >= SEED_COUNT:
        return [ls.id for ls in existing]

    skills = (
        db.query(Skill).filter(Skill.id.in_(skill_ids[:SEED_COUNT])).all()
        if skill_ids
        else load_seeded_skills(db)
    )

    grades = all_grades()
    existing_skill_ids = {ls.skill_id for ls in existing}
    listening_to_add = []

    for i, skill in enumerate(skills[:SEED_COUNT]):
        if skill.id in existing_skill_ids:
            continue
        listening_to_add.append(
            ListeningSkill(
                skill_id=skill.id,
                comprehension=grade_for_index(grades, i, 0),
                retention=grade_for_index(grades, i, 1),
                interpretation=grade_for_index(grades, i, 2),
                final_result=grade_for_index(grades, i, 3),
            )
        )

    if listening_to_add:
        db.add_all(listening_to_add)
        db.flush()

    return [ls.id for ls in _load_seeded_listening_skills(db)]
