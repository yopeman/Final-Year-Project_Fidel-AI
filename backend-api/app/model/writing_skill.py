from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel
from .skill import Grade


class WritingSkill(BaseModel):
    __tablename__ = "writing_skills"

    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, unique=True)
    coherence = Column(Enum(Grade), nullable=False)  # Grade
    grammar = Column(Enum(Grade), nullable=False)  # Grade
    vocabulary = Column(Enum(Grade), nullable=False)  # Grade
    punctuation = Column(Enum(Grade), nullable=False)  # Grade
    final_result = Column(Enum(Grade), nullable=False)  # Grade

    # Relationships
    skill = relationship("Skill", back_populates="writing_skill")