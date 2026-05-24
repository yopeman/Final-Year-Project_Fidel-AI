from app.model.comment_reactions import CommentReactions, ReactionType
from app.model.community_comment import CommunityComment

from seeds.common import SEED_COUNT
from seeds.community_seed_helpers import SEED_COMMUNITY_MARKER, load_seeded_users


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


def _load_seeded_comment_reactions(db):
    from app.model.batch import Batch
    from app.model.batch_community import BatchCommunity

    return (
        db.query(CommentReactions)
        .join(CommunityComment, CommentReactions.comment_id == CommunityComment.id)
        .join(BatchCommunity, CommunityComment.community_id == BatchCommunity.id)
        .join(Batch, BatchCommunity.batch_id == Batch.id)
        .filter(CommunityComment.content.like(f"{SEED_COMMUNITY_MARKER}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_comment_reactions(db, comment_ids=None, user_ids=None):
    """Seed 25 comment reactions (one per seeded community comment)."""
    existing = _load_seeded_comment_reactions(db)
    if len(existing) >= SEED_COUNT:
        return [r.id for r in existing]

    comments = _load_seeded_comments(db)
    if comment_ids:
        comments = (
            db.query(CommunityComment)
            .filter(CommunityComment.id.in_(comment_ids[:SEED_COUNT]))
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

    reaction_types = list(ReactionType)
    existing_comment_ids = {r.comment_id for r in existing}
    reactions_to_add = []

    for i, comment in enumerate(comments[:SEED_COUNT]):
        if comment.id in existing_comment_ids:
            continue
        reactor = users[(i + 3) % len(users)]
        reactions_to_add.append(
            CommentReactions(
                user_id=reactor.id,
                comment_id=comment.id,
                reaction_type=reaction_types[i % len(reaction_types)],
            )
        )

    if reactions_to_add:
        db.add_all(reactions_to_add)
        db.flush()

    return [r.id for r in _load_seeded_comment_reactions(db)]
