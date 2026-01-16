from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class SkillResult(BaseModel):
    __tablename__ = "skill_result"

    enrollment_id = Column(String(36), ForeignKey("batch_enrollment.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skill_test.id"), nullable=False)
    score = Column(Integer, nullable=False)

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="skill_results")
    skill = relationship("SkillTest", back_populates="results")
