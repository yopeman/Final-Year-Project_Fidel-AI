from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class LessonInteractions(BaseModel):
    __tablename__ = "lesson_interactions"

    lesson_id = Column(String(36), ForeignKey("module_lessons.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    # Relationships
    lesson = relationship("ModuleLessons", back_populates="interactions")
