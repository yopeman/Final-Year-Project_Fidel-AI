from app.model.community_comment import CommunityComment

from seeds.common import SEED_COUNT
from seeds.community_seed_helpers import (
    SEED_COMMUNITY_MARKER,
    load_seeded_batch_communities,
    load_seeded_users,
)


def _load_seeded_comments(db):
    from app.model.batch import Batch
    from app.model.batch_community import BatchCommunity

    return (
        db.query(CommunityComment)
        .join(BatchCommunity, CommunityComment.community_id == BatchCommunity.id)
        .join(Batch, BatchCommunity.batch_id == Batch.id)
        .filter(CommunityComment.content.like(f"{SEED_COMMUNITY_MARKER}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_community_comments(db, community_ids=None, user_ids=None):
    """Seed 25 community comments (one per seeded community post)."""
    existing = _load_seeded_comments(db)
    if len(existing) >= SEED_COUNT:
        return [c.id for c in existing]

    communities = load_seeded_batch_communities(db)
    if community_ids:
        from app.model.batch_community import BatchCommunity

        communities = (
            db.query(BatchCommunity)
            .filter(BatchCommunity.id.in_(community_ids[:SEED_COUNT]))
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

    comment_templates = [
        "Great post — thanks for sharing!",
        "I had the same question, following this thread.",
        "This resource helped me a lot too.",
        "Count me in for the study group.",
        "Could you share the link again?",
        "Agreed — consistency is key.",
        "I'll try that technique tomorrow.",
        "Congrats on finishing module 3!",
        "Adding this podcast to my playlist.",
        "My favorite new word this week: resilient.",
        "Saturday works for me.",
        "The rubric section on structure was helpful.",
        "Needed this motivation today, thank you.",
        "Love that idiom — going to use it.",
        "Evening sessions work better for me.",
        "I'll review your outline and reply.",
        "The pronunciation tips were excellent.",
        "Bookmarked the article — very useful.",
        "I use flashcards and spaced repetition.",
        "Happy to give feedback on recordings.",
        "Casual meetup sounds fun!",
        "Mock exam was tough but informative.",
        "Certificate timeline is clear now, thanks.",
        "Appreciate the encouragement!",
        "Final week — let's finish strong together.",
    ]

    existing_community_ids = {c.community_id for c in existing}
    comments_to_add = []

    for i, community in enumerate(communities[:SEED_COUNT]):
        if community.id in existing_community_ids:
            continue
        commenter = users[(i + 2) % len(users)]
        comments_to_add.append(
            CommunityComment(
                community_id=community.id,
                user_id=commenter.id,
                content=f"{SEED_COMMUNITY_MARKER} {comment_templates[i]}",
                is_edited=i % 9 == 0,
            )
        )

    if comments_to_add:
        db.add_all(comments_to_add)
        db.flush()

    return [c.id for c in _load_seeded_comments(db)]
