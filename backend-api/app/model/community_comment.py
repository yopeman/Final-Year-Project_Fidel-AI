from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class CommunityComment(BaseModel):
    __tablename__ = "community_comment"

    community_id = Column(String(36), ForeignKey("batch_community.id"), nullable=False)
    user_id = Column(String(36), nullable=False)
    content = Column(Text, nullable=False)
    is_edited = Column(Boolean, default=False)

    # Relationships
    community = relationship("BatchCommunity", back_populates="comments")
    reactions = relationship("CommentReaction", back_populates="comment")
