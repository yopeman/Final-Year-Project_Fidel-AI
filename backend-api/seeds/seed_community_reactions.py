from app.model.community_reactions import CommunityReactions, ReactionType

from seeds.common import SEED_COUNT
from seeds.community_seed_helpers import load_seeded_batch_communities, load_seeded_users


def _load_seeded_reactions(db):
    from app.model.batch import Batch
    from app.model.batch_community import BatchCommunity
    from seeds.community_seed_helpers import SEED_COMMUNITY_MARKER

    return (
        db.query(CommunityReactions)
        .join(BatchCommunity, CommunityReactions.community_id == BatchCommunity.id)
        .join(Batch, BatchCommunity.batch_id == Batch.id)
        .filter(
            Batch.name.like("Seed Batch%"),
            BatchCommunity.content.like(f"{SEED_COMMUNITY_MARKER}%"),
        )
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_community_reactions(db, community_ids=None, user_ids=None):
    """Seed 25 community reactions (one per seeded community post)."""
    existing = _load_seeded_reactions(db)
    if len(existing) >= SEED_COUNT:
        return [r.id for r in existing]

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

    reaction_types = list(ReactionType)
    existing_community_ids = {r.community_id for r in existing}
    reactions_to_add = []

    for i, community in enumerate(communities[:SEED_COUNT]):
        if community.id in existing_community_ids:
            continue
        # React as a different user than the post author when possible
        reactor = users[(i + 1) % len(users)]
        reactions_to_add.append(
            CommunityReactions(
                user_id=reactor.id,
                community_id=community.id,
                reaction_type=reaction_types[i % len(reaction_types)],
            )
        )

    if reactions_to_add:
        db.add_all(reactions_to_add)
        db.flush()

    return [r.id for r in _load_seeded_reactions(db)]
