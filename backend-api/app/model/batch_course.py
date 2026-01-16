from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class BatchCourse(BaseModel):
    __tablename__ = "batch_courses"

    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=False)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)

    # Relationships
    batch = relationship("Batch", back_populates="batch_courses")
    course = relationship("Course", back_populates="batch_courses")
    schedules = relationship("CourseSchedule", back_populates="batch_course")
    quizzes = relationship("Quiz", back_populates="batch_course")
    instructors = relationship("BatchInstructor", back_populates="batch_course")
