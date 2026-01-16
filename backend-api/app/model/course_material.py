from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class CourseMaterial(BaseModel):
    __tablename__ = "course_material"

    course_id = Column(String(36), ForeignKey("course.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Relationships
    course = relationship("Course", back_populates="materials")
    files = relationship("MaterialFile", back_populates="material")
