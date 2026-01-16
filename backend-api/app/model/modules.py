from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Modules(BaseModel):
    __tablename__ = "modules"

    profile_id = Column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False)
    is_locked = Column(Boolean, default=True)

    # Relationships
    profile = relationship("StudentProfile", back_populates="modules")
    lessons = relationship("ModuleLessons", back_populates="module")
