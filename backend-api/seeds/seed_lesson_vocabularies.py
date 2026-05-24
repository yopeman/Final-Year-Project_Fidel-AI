from app.model.lesson_vocabularies import LessonVocabularies
from app.model.module_lessons import ModuleLessons
from app.model.modules import Modules
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT
from seeds.lesson_seed_helpers import SEED_MODULE_PREFIX, load_seeded_lessons

SEED_VOCAB_PREFIX = "seed-vocab"


def _load_seeded_vocabularies(db):
    return (
        db.query(LessonVocabularies)
        .join(ModuleLessons, LessonVocabularies.lesson_id == ModuleLessons.id)
        .join(Modules, ModuleLessons.module_id == Modules.id)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(Modules.name.like(f"{SEED_MODULE_PREFIX}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_lesson_vocabularies(db, lesson_ids=None):
    """Seed 25 lesson vocabulary entries (one per seeded lesson)."""
    existing = _load_seeded_vocabularies(db)
    if len(existing) >= SEED_COUNT:
        return [v.id for v in existing]

    lessons = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id.in_(lesson_ids[:SEED_COUNT]))
        .all()
        if lesson_ids
        else load_seeded_lessons(db)
    )

    words = [
        ("hello", "a greeting"),
        ("goodbye", "a farewell"),
        ("please", "polite request"),
        ("thank you", "expression of gratitude"),
        ("excuse me", "polite interruption"),
        ("journey", "an act of traveling"),
        ("ticket", "pass for travel"),
        ("reservation", "booking in advance"),
        ("menu", "list of food options"),
        ("receipt", "proof of payment"),
        ("appointment", "scheduled meeting"),
        ("deadline", "due date"),
        ("feedback", "constructive response"),
        ("negotiate", "discuss to reach agreement"),
        ("summarize", "give a brief overview"),
        ("analyze", "examine in detail"),
        ("collaborate", "work together"),
        ("innovate", "introduce something new"),
        ("prioritize", "order by importance"),
        ("articulate", "express clearly"),
        ("comprehend", "understand fully"),
        ("fluency", "smooth language use"),
        ("coherent", "logical and consistent"),
        ("nuance", "subtle difference"),
        ("proficient", "skilled and competent"),
    ]

    existing_lesson_ids = {v.lesson_id for v in existing}
    vocab_to_add = []

    for i, lesson in enumerate(lessons[:SEED_COUNT]):
        if lesson.id in existing_lesson_ids:
            continue
        word, meaning = words[i]
        vocab_to_add.append(
            LessonVocabularies(
                lesson_id=lesson.id,
                vocabulary=word,
                meaning=meaning,
                description=f"{SEED_VOCAB_PREFIX}: Example usage of '{word}' in context.",
            )
        )

    if vocab_to_add:
        db.add_all(vocab_to_add)
        db.flush()

    return [v.id for v in _load_seeded_vocabularies(db)]
