from sqlalchemy import Column, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import EnrollmentStatus

class BatchEnrollment(BaseModel):
    __tablename__ = "batch_enrollment"

    profile_id = Column(String(36), ForeignKey("student_profile.id"), nullable=False)
    batch_id = Column(String(36), ForeignKey("batch.id"), nullable=False)
    enrollment_date = Column(Date, nullable=False)
    completion_date = Column(Date)
    status = Column(Enum(EnrollmentStatus), nullable=False)

    # Relationships
    profile = relationship("StudentProfile", back_populates="batch_enrollments")
    batch = relationship("Batch", back_populates="enrollments")
    quiz_results = relationship("QuizResult", back_populates="enrollment")
    skill_results = relationship("SkillResult", back_populates="enrollment")
    payments = relationship("Payment", back_populates="enrollment")
    certificates = relationship("Certificate", back_populates="enrollment")
