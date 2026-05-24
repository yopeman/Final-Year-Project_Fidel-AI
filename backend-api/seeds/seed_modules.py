from app.model.modules import Modules
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN

SEED_MODULE_PREFIX = "Seed Module"


def _load_seeded_profiles(db):
    return (
        db.query(StudentProfile)
        .join(User, StudentProfile.user_id == User.id)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_modules(db):
    return (
        db.query(Modules)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(Modules.name.like(f"{SEED_MODULE_PREFIX}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_modules(db, profile_ids=None):
    """Seed 25 learning modules (one per seeded student profile)."""
    existing = _load_seeded_modules(db)
    if len(existing) >= SEED_COUNT:
        return [m.id for m in existing]

    profiles = _load_seeded_profiles(db)
    if profile_ids:
        profiles = (
            db.query(StudentProfile)
            .join(User, StudentProfile.user_id == User.id)
            .filter(StudentProfile.id.in_(profile_ids[:SEED_COUNT]))
            .order_by(User.email)
            .all()
        )

    module_topics = [
        "Greetings & Introductions",
        "Daily Routines",
        "Travel & Directions",
        "Food & Dining",
        "Shopping",
        "Health & Wellness",
        "Work & Office",
        "Technology",
        "Education",
        "Entertainment",
        "Nature & Environment",
        "Family & Relationships",
        "Hobbies",
        "News & Media",
        "Opinions & Debates",
        "Problem Solving",
        "Customer Service",
        "Presentations",
        "Negotiations",
        "Emails & Reports",
        "Interview Skills",
        "Academic Writing",
        "Listening Lab",
        "Pronunciation Clinic",
        "Capstone Review",
    ]

    existing_profile_ids = {m.profile_id for m in existing}
    modules_to_add = []

    for i, profile in enumerate(profiles[:SEED_COUNT]):
        if profile.id in existing_profile_ids:
            continue
        modules_to_add.append(
            Modules(
                profile_id=profile.id,
                name=f"{SEED_MODULE_PREFIX}: {module_topics[i]}",
                description=f"Module {i + 1} — {module_topics[i].lower()} for personalized learning.",
                display_order=i + 1,
                is_locked=i % 4 == 0,
            )
        )

    if modules_to_add:
        db.add_all(modules_to_add)
        db.flush()

    return [m.id for m in _load_seeded_modules(db)]
