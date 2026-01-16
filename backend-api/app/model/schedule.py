from sqlalchemy import Column, String, Time, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Schedule(BaseModel):
    __tablename__ = "schedule"

    day_of_week = Column(String(20), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    course_schedules = relationship("CourseSchedule", back_populates="schedule")
