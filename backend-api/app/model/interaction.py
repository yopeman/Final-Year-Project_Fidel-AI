from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Interaction(BaseModel):
    __tablename__ = "interaction"

    conversation_id = Column(String(36), ForeignKey("free_conversation.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    # Relationships
    conversation = relationship("FreeConversation", back_populates="interactions")
