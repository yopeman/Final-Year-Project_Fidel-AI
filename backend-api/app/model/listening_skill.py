from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel
from .skill import Grade


class ListeningSkill(BaseModel):
    __tablename__ = "listening_skills"

    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, unique=True)
    comprehension = Column(Enum(Grade), nullable=False)  # Grade
    retention = Column(Enum(Grade), nullable=False)  # Grade
    interpretation = Column(Enum(Grade), nullable=False)  # Grade
    final_result = Column(Enum(Grade), nullable=False)  # Grade

    # Relationships
    skill = relationship("Skill", back_populates="listening_skill")