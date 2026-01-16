from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Course(BaseModel):
    __tablename__ = "courses"

    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    materials = relationship("CourseMaterial", back_populates="course")
    batch_courses = relationship("BatchCourse", back_populates="course")
