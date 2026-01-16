from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Interactions(BaseModel):
    __tablename__ = "interactions"

    conversation_id = Column(
        String(36), ForeignKey("free_conversations.id"), nullable=False
    )
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    # Relationships
    conversation = relationship("FreeConversation", back_populates="interactions")
