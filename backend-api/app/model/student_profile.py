from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class AgeRange(PyEnum):
    under_18 = "under_18"
    _18_25 = "18_25"
    _26_35 = "26_35"
    _36_45 = "36_45"
    _45_plus = "45_plus"


class Proficiency(PyEnum):
    beginner = "beginner"
    basic = "basic"
    intermediate = "intermediate"
    advanced = "advanced"


class DurationUnit(PyEnum):
    days = "days"
    weeks = "weeks"
    months = "months"
    years = "years"


class StudentProfile(BaseModel):
    __tablename__ = "student_profiles"

    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    age_range = Column(Enum(AgeRange), nullable=False)
    proficiency = Column(Enum(Proficiency), nullable=False)
    native_language = Column(String(50), nullable=False)
    learning_goal = Column(Text, nullable=False)
    target_duration = Column(Integer, nullable=False)
    duration_unit = Column(Enum(DurationUnit), nullable=False)
    constraints = Column(Text, nullable=True)
    ai_learning_plan = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="profile")
    modules = relationship("Modules", back_populates="profile")
    free_conversations = relationship("FreeConversation", back_populates="profile")
    batch_enrollments = relationship("BatchEnrollment", back_populates="profile")
