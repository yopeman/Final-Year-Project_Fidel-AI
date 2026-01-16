from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Course(BaseModel):
    __tablename__ = "course"

    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Relationships
    materials = relationship("CourseMaterial", back_populates="course")
    batch_courses = relationship("BatchCourse", back_populates="course")
