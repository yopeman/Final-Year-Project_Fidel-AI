from sqlalchemy import Column, String, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import QuizType

class Quiz(BaseModel):
    __tablename__ = "quiz"

    batch_course_id = Column(String(36), ForeignKey("batch_course.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    type = Column(Enum(QuizType), nullable=False)

    # Relationships
    batch_course = relationship("BatchCourse", back_populates="quizzes")
    results = relationship("QuizResult", back_populates="quiz")
