from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class FreeConversation(BaseModel):
    __tablename__ = "free_conversations"

    profile_id = Column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    starting_topic = Column(String(1000), nullable=False)
    topic_summary_phrase = Column(Text, nullable=True)

    # Relationships
    profile = relationship("StudentProfile", back_populates="free_conversations")
    interactions = relationship(
        "ConversationInteractions", back_populates="conversation"
    )
