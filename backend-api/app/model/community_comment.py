from sqlalchemy import Boolean, Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class CommunityComment(BaseModel):
    __tablename__ = "community_comments"

    community_id = Column(
        String(36), ForeignKey("batch_communities.id"), nullable=False
    )
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_edited = Column(Boolean, default=False)

    # Relationships
    community = relationship("BatchCommunity", back_populates="comments")
    user = relationship("User", back_populates="community_comments")
    reactions = relationship("CommentReactions", back_populates="comment")
