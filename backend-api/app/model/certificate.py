from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Certificate(BaseModel):
    __tablename__ = "certificate"

    enrollment_id = Column(String(36), ForeignKey("batch_enrollment.id"), nullable=False)
    result = Column(Text, nullable=False)
    certificate_html = Column(Text, nullable=False)

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="certificates")
