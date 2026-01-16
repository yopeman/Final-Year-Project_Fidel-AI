from sqlalchemy import Column, Integer, String, Text, Date, Boolean, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import BatchLevel, BatchStatus

class Batch(BaseModel):
    __tablename__ = "batch"

    name = Column(String(255), nullable=False)
    description = Column(Text)
    level = Column(Enum(BatchLevel), nullable=False)
    language = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    max_students = Column(Integer, nullable=False)
    status = Column(Enum(BatchStatus), nullable=False)
    fee_amount = Column(Numeric(10, 2), nullable=False)

    # Relationships
    batch_courses = relationship("BatchCourse", back_populates="batch")
    enrollments = relationship("BatchEnrollment", back_populates="batch")
    communities = relationship("BatchCommunity", back_populates="batch")
