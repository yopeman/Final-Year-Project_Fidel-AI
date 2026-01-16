from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class SkillTestType(PyEnum):
    reading = "reading"
    writing = "writing"
    speaking = "speaking"
    listening = "listening"


class SkillTests(BaseModel):
    __tablename__ = "skill_tests"

    evaluator_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(Enum(SkillTestType), nullable=False)

    # Relationships
    evaluator = relationship("User", backref="skill_tests")
    results = relationship("SkillResult", back_populates="skill_test")
