from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import ReactionType

class CommunityReaction(BaseModel):
    __tablename__ = "community_reaction"

    user_id = Column(String(36), nullable=False)
    community_id = Column(String(36), ForeignKey("batch_community.id"), nullable=False)
    reaction_type = Column(Enum(ReactionType), nullable=False)

    # Relationships
    community = relationship("BatchCommunity", back_populates="reactions")
