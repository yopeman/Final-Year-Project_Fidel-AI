from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import ReactionType

class CommentReaction(BaseModel):
    __tablename__ = "comment_reaction"

    user_id = Column(String(36), nullable=False)
    comment_id = Column(String(36), ForeignKey("community_comment.id"), nullable=False)
    reaction_type = Column(Enum(ReactionType), nullable=False)

    # Relationships
    comment = relationship("CommunityComment", back_populates="reactions")
