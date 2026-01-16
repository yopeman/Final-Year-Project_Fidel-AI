from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class CourseMaterial(BaseModel):
    __tablename__ = "course_materials"

    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="materials")
    files = relationship("MaterialFiles", back_populates="material")
