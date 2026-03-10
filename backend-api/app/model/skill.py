from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class Grade(PyEnum):
    A_PLUS = "A+"
    A = "A"
    A_MINUS = "A-"
    B_PLUS = "B+"
    B = "B"
    B_MINUS = "B-"
    C_PLUS = "C+"
    C = "C"
    C_MINUS = "C-"
    D = "D"
    F = "F"
    FX = "Fx"


class Skill(BaseModel):
    __tablename__ = "skills"

    enrollment_id = Column(String(36), ForeignKey("batch_enrollments.id"), nullable=False, unique=True)
    instructor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    final_result = Column(Enum(Grade), nullable=False)  # Using String to store grade

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="skill")
    instructor = relationship("User")
    certificate = relationship("Certificate", uselist=False, back_populates="skill")
    speaking_skill = relationship("SpeakingSkill", uselist=False, back_populates="skill")
    reading_skill = relationship("ReadingSkill", uselist=False, back_populates="skill")
    writing_skill = relationship("WritingSkill", uselist=False, back_populates="skill")
    listening_skill = relationship("ListeningSkill", uselist=False, back_populates="skill")
