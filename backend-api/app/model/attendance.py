from sqlalchemy import Column, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import UserType, AttendanceStatus

class Attendance(BaseModel):
    __tablename__ = "attendance"

    course_schedule_id = Column(String(36), ForeignKey("course_schedule.id"), nullable=False)
    user_id = Column(String(36), nullable=False)
    user_type = Column(Enum(UserType), nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    attendance_date = Column(Date, nullable=False)

    # Relationships
    course_schedule = relationship("CourseSchedule", back_populates="attendances")
