from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel
from .skill import Grade


class ReadingSkill(BaseModel):
    __tablename__ = "reading_skills"

    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False, unique=True)
    comprehension = Column(Enum(Grade), nullable=False)  # Grade
    speed = Column(Enum(Grade), nullable=False)  # Grade
    vocabulary = Column(Enum(Grade), nullable=False)  # Grade
    final_result = Column(Enum(Grade), nullable=False)  # Grade

    # Relationships
    skill = relationship("Skill", back_populates="reading_skill")