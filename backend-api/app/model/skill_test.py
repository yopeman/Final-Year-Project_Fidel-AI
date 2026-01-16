from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import SkillType

class SkillTest(BaseModel):
    __tablename__ = "skill_test"

    evaluator_id = Column(String(36), nullable=False)
    type = Column(Enum(SkillType), nullable=False)

    # Relationships
    results = relationship("SkillResult", back_populates="skill")
