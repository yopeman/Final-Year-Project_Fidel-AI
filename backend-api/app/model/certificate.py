from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Certificate(BaseModel):
    __tablename__ = "certificates"

    skill_id = Column(
        String(36), ForeignKey("skills.id"), nullable=False, unique=True
    )
    result = Column(Text, nullable=False)
    certificate_html = Column(Text, nullable=False)

    # Relationships
    skill = relationship("Skill", back_populates="certificate")
