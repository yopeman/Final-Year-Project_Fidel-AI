from app.model.student_profile import (
    AgeRange,
    DurationUnit,
    Proficiency,
    StudentProfile,
)
from app.model.user import User

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN


def _load_seeded_profiles(db):
    return (
        db.query(StudentProfile)
        .join(User, StudentProfile.user_id == User.id)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_student_profiles(db, user_ids=None):
    """Seed 25 student profiles (one per seeded user)."""
    profiles = _load_seeded_profiles(db)
    if len(profiles) >= SEED_COUNT:
        return [p.id for p in profiles]

    users = (
        db.query(User)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )
    if user_ids and user_ids.get("all"):
        users_by_id = {u.id: u for u in users}
        users = [users_by_id[uid] for uid in user_ids["all"][:SEED_COUNT] if uid in users_by_id]

    existing_user_ids = {p.user_id for p in profiles}
    users_to_seed = [u for u in users if u.id not in existing_user_ids][:SEED_COUNT]

    age_ranges = list(AgeRange)
    proficiencies = list(Proficiency)
    duration_units = list(DurationUnit)
    native_languages = [
        "Spanish", "French", "German", "Portuguese", "Italian",
        "Chinese", "Japanese", "Korean", "Arabic", "Hindi",
        "Vietnamese", "Thai", "Russian", "Dutch", "Polish",
        "Turkish", "Swahili", "Bengali", "Urdu", "Greek",
        "Hebrew", "Indonesian", "Malay", "Tagalog", "Tamil",
    ]
    learning_goals = [
        "Improve conversational English for travel",
        "Prepare for IELTS exam",
        "Business English for meetings and emails",
        "Academic English for university studies",
        "Pass TOEFL with a high score",
        "Daily communication with colleagues abroad",
        "Read technical documentation in English",
        "Write professional reports in English",
        "Understand movies and TV without subtitles",
        "Build confidence in public speaking",
        "Interview preparation in English",
        "Customer support communication skills",
        "Medical English for healthcare work",
        "Legal English for contract review",
        "Tourism and hospitality English",
        "STEM vocabulary for engineering",
        "Presentation skills for conferences",
        "Negotiation language for sales",
        "Creative writing in English",
        "Debate and argumentation practice",
        "Pronunciation and accent reduction",
        "Listening skills for podcasts",
        "Grammar fundamentals refresh",
        "Vocabulary expansion for fluency",
        "Cross-cultural communication skills",
    ]

    profiles_to_add = []
    for i, user in enumerate(users_to_seed):
        profiles_to_add.append(
            StudentProfile(
                user_id=user.id,
                age_range=age_ranges[i % len(age_ranges)],
                proficiency=proficiencies[i % len(proficiencies)],
                native_language=native_languages[i % len(native_languages)],
                learning_goal=learning_goals[i % len(learning_goals)],
                target_duration=(i % 12) + 1,
                duration_unit=duration_units[i % len(duration_units)],
                constraints=f"Available {2 + (i % 5)} hours per week" if i % 3 else None,
                ai_learning_plan=f"Personalized plan #{i + 1}" if i % 4 == 0 else None,
            )
        )

    if profiles_to_add:
        db.add_all(profiles_to_add)
        db.flush()
    return [p.id for p in _load_seeded_profiles(db)]
