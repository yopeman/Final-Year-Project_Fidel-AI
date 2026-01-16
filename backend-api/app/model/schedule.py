from sqlalchemy import Column, String, Time
from sqlalchemy.orm import relationship

from .base import BaseModel


class Schedule(BaseModel):
    __tablename__ = "schedules"

    day_of_week = Column(String(10), nullable=False)  # e.g., 'monday', 'tuesday'
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    course_schedules = relationship("CourseSchedule", back_populates="schedule")
