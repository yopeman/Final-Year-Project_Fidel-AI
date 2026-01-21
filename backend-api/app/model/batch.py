from datetime import date
from enum import Enum as PyEnum

from sqlalchemy import (Column, Date, Enum, Float, ForeignKey, Integer, String,
                        Text)
from sqlalchemy.orm import relationship

from .base import BaseModel
from .batch_course import BatchCourse
from .batch_instructor import BatchInstructor


class BatchLevel(PyEnum):
    beginner = "beginner"
    basic = "basic"
    intermediate = "intermediate"
    advanced = "advanced"


class BatchStatus(PyEnum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class Batch(BaseModel):
    __tablename__ = "batches"

    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(Enum(BatchLevel), nullable=False)
    language = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    max_students = Column(Integer, nullable=False)
    status = Column(Enum(BatchStatus), nullable=False)
    fee_amount = Column(Float, nullable=False)

    # Relationships
    batch_courses = relationship("BatchCourse", back_populates="batch")
    enrollments = relationship("BatchEnrollment", back_populates="batch")
    communities = relationship("BatchCommunity", back_populates="batch")
    instructors = relationship(
        "BatchInstructor",
        secondary="batch_courses",
        primaryjoin="Batch.id == BatchCourse.batch_id",
        secondaryjoin="BatchCourse.id == BatchInstructor.batch_course_id",
        viewonly=True
    )
