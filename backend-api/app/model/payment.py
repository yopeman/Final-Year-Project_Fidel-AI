from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import PaymentStatus

class Payment(BaseModel):
    __tablename__ = "payment"

    enrollment_id = Column(String(36), ForeignKey("batch_enrollment.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    method = Column(String(50), nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False)
    paid_at = Column(DateTime(timezone=True))
    transaction_id = Column(String(100))
    receipt_URL = Column(String(500))

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="payments")
