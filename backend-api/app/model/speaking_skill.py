from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel
from .skill import Grade


class SpeakingSkill(BaseModel):
    __tablename__ = "speaking_skills"

    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    pronunciation = Column(Enum(Grade), nullable=False)  # Grade
    fluency = Column(Enum(Grade), nullable=False)  # Grade
    grammar = Column(Enum(Grade), nullable=False)  # Grade
    vocabulary = Column(Enum(Grade), nullable=False)  # Grade
    coherence = Column(Enum(Grade), nullable=False)  # Grade
    final_result = Column(Enum(Grade), nullable=False)  # Grade

    # Relationships
    skill = relationship("Skill", back_populates="speaking_skill")