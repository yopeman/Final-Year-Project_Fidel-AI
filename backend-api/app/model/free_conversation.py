from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class FreeConversation(BaseModel):
    __tablename__ = "free_conversation"

    profile_id = Column(String(36), ForeignKey("student_profile.id"), nullable=False)
    starting_topic = Column(String(255), nullable=False)
    topic_summary_phrase = Column(String(255), nullable=False)

    # Relationships
    profile = relationship("StudentProfile", back_populates="free_conversations")
    interactions = relationship("Interaction", back_populates="conversation")
