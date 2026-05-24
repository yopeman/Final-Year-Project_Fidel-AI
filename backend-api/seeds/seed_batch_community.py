from app.model.batch_community import BatchCommunity

from seeds.common import SEED_COUNT
from seeds.community_seed_helpers import (
    SEED_COMMUNITY_MARKER,
    load_seeded_batch_communities,
    load_seeded_batches,
    load_seeded_users,
)


def seed_batch_community(db, batch_ids=None, user_ids=None):
    """Seed 25 batch community posts (one per seeded batch)."""
    existing = load_seeded_batch_communities(db)
    if len(existing) >= SEED_COUNT:
        return [p.id for p in existing]

    batches = load_seeded_batches(db)
    if batch_ids:
        from app.model.batch import Batch

        batches = (
            db.query(Batch)
            .filter(Batch.id.in_(batch_ids[:SEED_COUNT]))
            .order_by(Batch.name)
            .all()
        )

    users = load_seeded_users(db)
    if user_ids and user_ids.get("all"):
        from app.model.user import User

        users = (
            db.query(User)
            .filter(User.id.in_(user_ids["all"][:SEED_COUNT]))
            .order_by(User.email)
            .all()
        )

    post_templates = [
        "Welcome everyone to this batch! Introduce yourself below.",
        "Sharing my study plan for the week — what are your goals?",
        "Useful resource I found for grammar practice.",
        "Anyone want to pair up for speaking practice?",
        "Reminder: assignment due this Friday.",
        "Great tip from today's class — note taking really helps.",
        "Question about the listening homework — section 2 is tricky.",
        "Celebrating finishing module 3 — keep going team!",
        "Recommended podcast for commute listening.",
        "Weekly vocabulary challenge — post your favorite new word.",
        "Study group meeting Saturday 10am — who's in?",
        "Clarification on the rubric for the writing task.",
        "Motivation post: small daily practice adds up.",
        "Favorite idiom I learned this week.",
        "Quick poll: prefer morning or evening study sessions?",
        "Sharing my presentation outline for feedback.",
        "Thanks to the tutor for the pronunciation tips!",
        "Link to extra reading on today's topic.",
        "How do you review vocabulary effectively?",
        "Peer feedback thread for speaking recordings.",
        "Batch outing idea — practice English in a casual setting.",
        "Reflection on progress after the midterm mock.",
        "Question about enrollment and certificate timeline.",
        "Encouragement for anyone feeling behind — you've got this.",
        "Wrap-up thoughts as we approach the final week.",
    ]

    existing_batch_ids = {p.batch_id for p in existing}
    posts_to_add = []

    for i, batch in enumerate(batches[:SEED_COUNT]):
        if batch.id in existing_batch_ids:
            continue
        user = users[i % len(users)]
        posts_to_add.append(
            BatchCommunity(
                batch_id=batch.id,
                user_id=user.id,
                content=f"{SEED_COMMUNITY_MARKER} {post_templates[i]}",
                is_edited=i % 7 == 0,
            )
        )

    if posts_to_add:
        db.add_all(posts_to_add)
        db.flush()

    return [p.id for p in load_seeded_batch_communities(db)]
