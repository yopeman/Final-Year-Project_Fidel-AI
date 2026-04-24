from sqlalchemy import Boolean, Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class BatchCommunity(BaseModel):
    __tablename__ = "batch_communities"

    batch_id = Column(String(36), ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_edited = Column(Boolean, default=False)

    # Relationships
    batch = relationship("Batch", back_populates="communities")
    user = relationship("User", back_populates="batch_communities")
    reactions = relationship(
        "CommunityReactions",
        back_populates="community",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    comments = relationship(
        "CommunityComment",
        back_populates="community",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    attachments = relationship(
        "CommunityAttachmentFiles",
        back_populates="community",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
