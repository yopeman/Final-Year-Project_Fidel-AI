"""Shared helpers for lesson-related seed scripts."""

from app.model.module_lessons import ModuleLessons
from app.model.modules import Modules
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT

SEED_MODULE_PREFIX = "Seed Module"
SEED_LESSON_PREFIX = "Seed Lesson"


def load_seeded_modules(db):
    return (
        db.query(Modules)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(Modules.name.like(f"{SEED_MODULE_PREFIX}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def load_seeded_lessons(db):
    return (
        db.query(ModuleLessons)
        .join(Modules, ModuleLessons.module_id == Modules.id)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(
            Modules.name.like(f"{SEED_MODULE_PREFIX}%"),
            ModuleLessons.title.like(f"{SEED_LESSON_PREFIX}%"),
        )
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )
