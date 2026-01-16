from datetime import date
from enum import Enum as PyEnum

from sqlalchemy import Column, Date, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class EnrollmentStatus(PyEnum):
    applied = "applied"
    enrolled = "enrolled"
    completed = "completed"
    dropped = "dropped"


class BatchEnrollment(BaseModel):
    __tablename__ = "batch_enrollments"

    profile_id = Column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=False)
    enrollment_date = Column(Date, nullable=False)
    completion_date = Column(Date, nullable=True)
    status = Column(Enum(EnrollmentStatus), nullable=False)

    # Relationships
    profile = relationship("StudentProfile", back_populates="batch_enrollments")
    batch = relationship("Batch", back_populates="enrollments")
    quiz_results = relationship("QuizResults", back_populates="enrollment")
    skill_results = relationship("SkillResult", back_populates="enrollment")
    payments = relationship("Payment", back_populates="enrollment")
    certificates = relationship("Certificate", back_populates="enrollment")
