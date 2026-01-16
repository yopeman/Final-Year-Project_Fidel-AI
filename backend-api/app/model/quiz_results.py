from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class QuizResults(BaseModel):
    __tablename__ = "quiz_results"

    enrollment_id = Column(
        String(36), ForeignKey("batch_enrollments.id"), nullable=False
    )
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False)
    score = Column(Integer, nullable=False)

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="results")
