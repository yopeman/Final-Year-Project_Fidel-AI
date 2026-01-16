from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class BatchCourse(BaseModel):
    __tablename__ = "batch_course"

    batch_id = Column(String(36), ForeignKey("batch.id"), nullable=False)
    course_id = Column(String(36), ForeignKey("course.id"), nullable=False)

    # Relationships
    batch = relationship("Batch", back_populates="batch_courses")
    course = relationship("Course", back_populates="batch_courses")
    instructors = relationship("BatchInstructor", back_populates="batch_course")
    course_schedules = relationship("CourseSchedule", back_populates="batch_course")
    quizzes = relationship("Quiz", back_populates="batch_course")
