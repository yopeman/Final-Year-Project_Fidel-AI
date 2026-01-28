from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class ConversationInteractions(BaseModel):
    __tablename__ = "conversation_interactions"

    conversation_id = Column(
        String(36), ForeignKey("free_conversations.id"), nullable=False
    )
    student_text = Column(Text, nullable=False)
    student_audio_url = Column(String(500), nullable=True)
    ai_text = Column(Text, nullable=False)
    ai_audio_url = Column(String(500), nullable=True)

    # Relationships
    conversation = relationship("FreeConversation", back_populates="interactions")
