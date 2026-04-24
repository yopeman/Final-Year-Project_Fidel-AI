from enum import Enum
from sqlalchemy import Column, Enum as SQLEnum, Time
from sqlalchemy.orm import relationship

from .base import BaseModel


class DayOfWeek(Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class Schedule(BaseModel):
    __tablename__ = "schedules"

    day_of_week = Column(SQLEnum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    course_schedules = relationship(
        "CourseSchedule",
        back_populates="schedule",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
