from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class LessonInteraction(BaseModel):
    __tablename__ = "lesson_interaction"

    lesson_id = Column(String(36), ForeignKey("module_lesson.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    # Relationships
    lesson = relationship("ModuleLesson", back_populates="interactions")
