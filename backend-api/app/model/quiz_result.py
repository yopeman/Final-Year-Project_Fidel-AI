from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class QuizResult(BaseModel):
    __tablename__ = "quiz_result"

    enrollment_id = Column(String(36), ForeignKey("batch_enrollment.id"), nullable=False)
    quiz_id = Column(String(36), ForeignKey("quiz.id"), nullable=False)
    score = Column(Float, nullable=False)

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="results")
