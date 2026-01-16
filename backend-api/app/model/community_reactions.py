from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class ReactionType(PyEnum):
    like = "like"
    dislike = "dislike"
    love = "love"


class CommunityReactions(BaseModel):
    __tablename__ = "community_reactions"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    community_id = Column(
        String(36), ForeignKey("batch_communities.id"), nullable=False
    )
    reaction_type = Column(Enum(ReactionType), nullable=False)

    # Relationships
    user = relationship("User", back_populates="community_reactions")
    community = relationship("BatchCommunity", back_populates="reactions")
