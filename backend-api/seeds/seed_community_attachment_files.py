from app.model.community_attachment_files import CommunityAttachmentFiles

from seeds.common import SEED_COUNT
from seeds.community_seed_helpers import load_seeded_batch_communities

SEED_ATTACHMENT_PREFIX = "Seed Attachment"


def _load_seeded_attachments(db):
    from app.model.batch import Batch
    from app.model.batch_community import BatchCommunity

    return (
        db.query(CommunityAttachmentFiles)
        .join(BatchCommunity, CommunityAttachmentFiles.community_id == BatchCommunity.id)
        .join(Batch, BatchCommunity.batch_id == Batch.id)
        .filter(CommunityAttachmentFiles.file_name.like(f"{SEED_ATTACHMENT_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_community_attachment_files(db, community_ids=None):
    """Seed 25 community post attachments (one per seeded community post)."""
    existing = _load_seeded_attachments(db)
    if len(existing) >= SEED_COUNT:
        return [a.id for a in existing]

    communities = load_seeded_batch_communities(db)
    if community_ids:
        from app.model.batch_community import BatchCommunity

        communities = (
            db.query(BatchCommunity)
            .filter(BatchCommunity.id.in_(community_ids[:SEED_COUNT]))
            .all()
        )

    extensions = ["pdf", "png", "jpg", "docx", "zip"]
    existing_community_ids = {a.community_id for a in existing}
    attachments_to_add = []

    for i, community in enumerate(communities[:SEED_COUNT]):
        if community.id in existing_community_ids:
            continue
        ext = extensions[i % len(extensions)]
        attachments_to_add.append(
            CommunityAttachmentFiles(
                community_id=community.id,
                file_name=f"{SEED_ATTACHMENT_PREFIX}: post-{i + 1:02d}.{ext}",
                file_path=f"/uploads/seed/community/{community.id}/attachment_{i + 1:02d}.{ext}",
                file_extension=ext,
                file_size=2048 * (i + 1),
            )
        )

    if attachments_to_add:
        db.add_all(attachments_to_add)
        db.flush()

    return [a.id for a in _load_seeded_attachments(db)]
