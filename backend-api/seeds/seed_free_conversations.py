from app.model.free_conversation import FreeConversation
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN
from seeds.community_seed_helpers import SEED_CONV_MARKER, load_seeded_profiles


def _load_seeded_conversations(db):
    return (
        db.query(FreeConversation)
        .join(StudentProfile, FreeConversation.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(FreeConversation.starting_topic.like(f"{SEED_CONV_MARKER}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_free_conversations(db, profile_ids=None):
    """Seed 25 free conversations (one per seeded student profile)."""
    existing = _load_seeded_conversations(db)
    if len(existing) >= SEED_COUNT:
        return [c.id for c in existing]

    profiles = load_seeded_profiles(db)
    if profile_ids:
        profiles = (
            db.query(StudentProfile)
            .join(User, StudentProfile.user_id == User.id)
            .filter(StudentProfile.id.in_(profile_ids[:SEED_COUNT]))
            .order_by(User.email)
            .all()
        )

    topics = [
        "Planning a weekend trip",
        "Ordering food at a restaurant",
        "Job interview preparation",
        "Discussing a favorite hobby",
        "Talking about daily routines",
        "Describing your hometown",
        "Shopping for clothes",
        "Making a doctor's appointment",
        "Discussing a recent movie",
        "Talking about future goals",
        "Explaining a work project",
        "Debating remote vs office work",
        "Describing a memorable vacation",
        "Talking about healthy habits",
        "Discussing technology trends",
        "Practicing small talk at a party",
        "Explaining a recipe",
        "Talking about environmental issues",
        "Discussing study strategies",
        "Describing a cultural festival",
        "Talking about sports and fitness",
        "Negotiating a schedule change",
        "Discussing books and reading",
        "Talking about music preferences",
        "Reflecting on learning progress",
    ]

    existing_profile_ids = {c.profile_id for c in existing}
    conversations_to_add = []

    for i, profile in enumerate(profiles[:SEED_COUNT]):
        if profile.id in existing_profile_ids:
            continue
        conversations_to_add.append(
            FreeConversation(
                profile_id=profile.id,
                starting_topic=f"{SEED_CONV_MARKER} {topics[i]}",
                topic_summary_phrase=f"Practice conversation about {topics[i].lower()}.",
            )
        )

    if conversations_to_add:
        db.add_all(conversations_to_add)
        db.flush()

    return [c.id for c in _load_seeded_conversations(db)]
