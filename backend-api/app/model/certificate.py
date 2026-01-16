from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Certificate(BaseModel):
    __tablename__ = "certificates"

    enrollment_id = Column(
        String(36), ForeignKey("batch_enrollments.id"), nullable=False
    )
    result = Column(Text, nullable=False)
    certificate_html = Column(Text, nullable=False)

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="certificates")
