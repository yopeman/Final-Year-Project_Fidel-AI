from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class InstructorRole(PyEnum):
    main = "main"
    assistant = "assistant"


class BatchInstructor(BaseModel):
    __tablename__ = "batch_instructors"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    batch_course_id = Column(String(36), ForeignKey("batch_courses.id"), nullable=False)
    role = Column(Enum(InstructorRole), nullable=False)

    # Relationships
    user = relationship("User", back_populates="batch_instructors")
    batch_course = relationship("BatchCourse", back_populates="instructors")
