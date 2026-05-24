"""Shared helpers for community and conversation seed scripts."""

from app.model.batch import Batch
from app.model.batch_community import BatchCommunity
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN

SEED_BATCH_PREFIX = "Seed Batch"
SEED_COMMUNITY_MARKER = "[seed-community]"
SEED_CONV_MARKER = "[seed-conv]"
SEED_CONV_INTERACTION_MARKER = "[seed-conv-interaction]"


def load_seeded_profiles(db):
    return (
        db.query(StudentProfile)
        .join(User, StudentProfile.user_id == User.id)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def load_seeded_batches(db):
    return (
        db.query(Batch)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def load_seeded_users(db):
    return (
        db.query(User)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def load_seeded_batch_communities(db):
    return (
        db.query(BatchCommunity)
        .join(Batch, BatchCommunity.batch_id == Batch.id)
        .filter(
            Batch.name.like(f"{SEED_BATCH_PREFIX}%"),
            BatchCommunity.content.like(f"{SEED_COMMUNITY_MARKER}%"),
        )
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )
