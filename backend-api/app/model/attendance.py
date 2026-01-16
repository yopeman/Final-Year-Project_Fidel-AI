from enum import Enum as PyEnum

from sqlalchemy import Column, Date, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class UserType(PyEnum):
    student = "student"
    tutor = "tutor"


class AttendanceStatus(PyEnum):
    present = "present"
    absent = "absent"
    late = "late"


class Attendance(BaseModel):
    __tablename__ = "attendances"

    course_schedule_id = Column(
        String(36), ForeignKey("course_schedules.id"), nullable=False
    )
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    user_type = Column(Enum(UserType), nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    attendance_date = Column(Date, nullable=False)

    # Relationships
    course_schedule = relationship("CourseSchedule", back_populates="attendances")
    user = relationship("User", back_populates="attendances")
