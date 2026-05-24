from app.model.module_lessons import ModuleLessons
from app.model.modules import Modules
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT
from seeds.lesson_seed_helpers import load_seeded_modules

SEED_LESSON_PREFIX = "Seed Lesson"


def _load_seeded_lessons(db):
    return (
        db.query(ModuleLessons)
        .join(Modules, ModuleLessons.module_id == Modules.id)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(ModuleLessons.title.like(f"{SEED_LESSON_PREFIX}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_module_lessons(db, module_ids=None):
    """Seed 25 module lessons (one per seeded module)."""
    existing = _load_seeded_lessons(db)
    if len(existing) >= SEED_COUNT:
        return [lesson.id for lesson in existing]

    modules = (
        db.query(Modules)
        .filter(Modules.id.in_(module_ids[:SEED_COUNT]))
        .all()
        if module_ids
        else load_seeded_modules(db)
    )

    lesson_titles = [
        "Getting Started",
        "Core Concepts",
        "Guided Practice",
        "Real-World Examples",
        "Common Mistakes",
        "Quick Review",
        "Listening Drill",
        "Speaking Exercise",
        "Reading Passage",
        "Writing Task",
        "Vocabulary Focus",
        "Grammar Spotlight",
        "Conversation Practice",
        "Role-Play Scenario",
        "Pronunciation Tips",
        "Cultural Notes",
        "Idioms & Phrases",
        "Mini Quiz",
        "Peer Discussion",
        "Self Assessment",
        "Challenge Activity",
        "Reflection Journal",
        "Bonus Resources",
        "Progress Check",
        "Module Wrap-Up",
    ]

    existing_module_ids = {lesson.module_id for lesson in existing}
    lessons_to_add = []

    for i, module in enumerate(modules[:SEED_COUNT]):
        if module.id in existing_module_ids:
            continue
        topic = module.name.split(": ", 1)[-1] if ": " in module.name else module.name
        lessons_to_add.append(
            ModuleLessons(
                module_id=module.id,
                title=f"{SEED_LESSON_PREFIX}: {lesson_titles[i]}",
                content=(
                    f"Lesson {i + 1} for {topic}. "
                    f"Covers {lesson_titles[i].lower()} with exercises and examples."
                ),
                display_order=1,
                is_completed=i % 5 == 0,
                is_locked=i % 3 == 0,
            )
        )

    if lessons_to_add:
        db.add_all(lessons_to_add)
        db.flush()

    return [lesson.id for lesson in _load_seeded_lessons(db)]
