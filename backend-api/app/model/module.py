from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Module(BaseModel):
    __tablename__ = "module"

    profile_id = Column(String(36), ForeignKey("student_profile.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    display_order = Column(Integer, nullable=False)
    is_locked = Column(Boolean, default=False)

    # Relationships
    profile = relationship("StudentProfile", back_populates="modules")
    lessons = relationship("ModuleLesson", back_populates="module")
