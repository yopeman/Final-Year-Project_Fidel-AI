from app.model.batch import Batch
from app.model.batch_enrollment import BatchEnrollment
from app.model.certificate import Certificate
from app.model.skill import Skill

from seeds.common import SEED_COUNT
from seeds.skill_seed_helpers import SEED_BATCH_PREFIX, load_seeded_skills

SEED_CERT_PREFIX = "Seed Certificate"


def _load_seeded_certificates(db):
    return (
        db.query(Certificate)
        .join(Skill, Certificate.skill_id == Skill.id)
        .join(BatchEnrollment, Skill.enrollment_id == BatchEnrollment.id)
        .join(Batch, BatchEnrollment.batch_id == Batch.id)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def _certificate_html(student_index: int, grade: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><title>{SEED_CERT_PREFIX} #{student_index:02d}</title></head>
<body>
  <h1>Certificate of Completion</h1>
  <p>This certifies that seed student #{student_index:02d} completed the program.</p>
  <p>Final grade: <strong>{grade}</strong></p>
</body>
</html>"""


def seed_certificates(db, skill_ids=None):
    """Seed 25 certificates (one per seeded skill)."""
    existing = _load_seeded_certificates(db)
    if len(existing) >= SEED_COUNT:
        return [c.id for c in existing]

    skills = (
        db.query(Skill).filter(Skill.id.in_(skill_ids[:SEED_COUNT])).all()
        if skill_ids
        else load_seeded_skills(db)
    )

    existing_skill_ids = {c.skill_id for c in existing}
    certificates_to_add = []

    for i, skill in enumerate(skills[:SEED_COUNT]):
        if skill.id in existing_skill_ids:
            continue
        grade = skill.final_result.value
        certificates_to_add.append(
            Certificate(
                skill_id=skill.id,
                result=f"{SEED_CERT_PREFIX}: Completed with grade {grade}",
                certificate_html=_certificate_html(i + 1, grade),
            )
        )

    if certificates_to_add:
        db.add_all(certificates_to_add)
        db.flush()

    return [c.id for c in _load_seeded_certificates(db)]
