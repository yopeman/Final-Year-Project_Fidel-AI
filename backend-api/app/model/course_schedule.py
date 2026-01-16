from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class CourseSchedule(BaseModel):
    __tablename__ = "course_schedules"

    schedule_id = Column(String(36), ForeignKey("schedules.id"), nullable=False)
    batch_course_id = Column(String(36), ForeignKey("batch_courses.id"), nullable=False)

    # Relationships
    schedule = relationship("Schedule", back_populates="course_schedules")
    batch_course = relationship("BatchCourse", back_populates="schedules")
    attendances = relationship("Attendance", back_populates="course_schedule")
