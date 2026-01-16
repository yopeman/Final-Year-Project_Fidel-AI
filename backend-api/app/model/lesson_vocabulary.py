from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class LessonVocabulary(BaseModel):
    __tablename__ = "lesson_vocabulary"

    lesson_id = Column(String(36), ForeignKey("module_lesson.id"), nullable=False)
    vocabulary = Column(String(255), nullable=False)
    meaning = Column(String(255), nullable=False)
    description = Column(Text)

    # Relationships
    lesson = relationship("ModuleLesson", back_populates="vocabularies")
