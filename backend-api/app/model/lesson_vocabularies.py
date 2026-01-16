from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class LessonVocabularies(BaseModel):
    __tablename__ = "lesson_vocabularies"

    lesson_id = Column(String(36), ForeignKey("module_lessons.id"), nullable=False)
    vocabulary = Column(String(100), nullable=False)
    meaning = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    lesson = relationship("ModuleLessons", back_populates="vocabularies")
