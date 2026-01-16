from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import AgeRange, Proficiency, DurationUnit

class StudentProfile(BaseModel):
    __tablename__ = "student_profile"

    user_id = Column(String(36), nullable=False)
    age_range = Column(Enum(AgeRange), nullable=False)
    proficiency = Column(Enum(Proficiency), nullable=False)
    native_language = Column(String(255), nullable=False)
    learning_goal = Column(Text, nullable=False)
    target_duration = Column(Integer, nullable=False)
    duration_unit = Column(Enum(DurationUnit), nullable=False)
    constraints = Column(Text)
    AI_learning_plan = Column(Text)

    # Relationships
    modules = relationship("Module", back_populates="profile")
    free_conversations = relationship("FreeConversation", back_populates="profile")
    batch_enrollments = relationship("BatchEnrollment", back_populates="profile")
