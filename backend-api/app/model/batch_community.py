from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class BatchCommunity(BaseModel):
    __tablename__ = "batch_community"

    batch_id = Column(String(36), ForeignKey("batch.id"), nullable=False)
    user_id = Column(String(36), nullable=False)
    content = Column(Text, nullable=False)
    is_edited = Column(Boolean, default=False)

    # Relationships
    batch = relationship("Batch", back_populates="communities")
    reactions = relationship("CommunityReaction", back_populates="community")
    comments = relationship("CommunityComment", back_populates="community")
    attachments = relationship("CommunityAttachmentFile", back_populates="community")
