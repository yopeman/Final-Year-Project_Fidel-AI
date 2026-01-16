from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class ReactionType(PyEnum):
    like = "like"
    dislike = "dislike"
    love = "love"


class CommentReactions(BaseModel):
    __tablename__ = "comment_reactions"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    comment_id = Column(String(36), ForeignKey("community_comments.id"), nullable=False)
    reaction_type = Column(Enum(ReactionType), nullable=False)

    # Relationships
    user = relationship("User", back_populates="comment_reactions")
    comment = relationship("CommunityComment", back_populates="reactions")
