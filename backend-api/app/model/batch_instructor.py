from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import InstructorRole

class BatchInstructor(BaseModel):
    __tablename__ = "batch_instructor"

    user_id = Column(String(36), nullable=False)
    batch_course_id = Column(String(36), ForeignKey("batch_course.id"), nullable=False)
    role = Column(Enum(InstructorRole), nullable=False)

    # Relationships
    batch_course = relationship("BatchCourse", back_populates="instructors")
