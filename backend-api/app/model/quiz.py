from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class QuizType(PyEnum):
    matching = "matching"
    true_false = "true_false"
    filling_the_gap = "filling_the_gap"


class Quiz(BaseModel):
    __tablename__ = "quizzes"

    batch_course_id = Column(String(36), ForeignKey("batch_courses.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    type = Column(Enum(QuizType), nullable=False)

    # Relationships
    batch_course = relationship("BatchCourse", back_populates="quizzes")
    results = relationship("QuizResults", back_populates="quiz")
