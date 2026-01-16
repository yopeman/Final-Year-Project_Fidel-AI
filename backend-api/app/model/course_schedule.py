from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class CourseSchedule(BaseModel):
    __tablename__ = "course_schedule"

    schedule_id = Column(String(36), ForeignKey("schedule.id"), nullable=False)
    batch_course_id = Column(String(36), ForeignKey("batch_course.id"), nullable=False)

    # Relationships
    schedule = relationship("Schedule", back_populates="course_schedules")
    batch_course = relationship("BatchCourse", back_populates="course_schedules")
    attendances = relationship("Attendance", back_populates="course_schedule")
