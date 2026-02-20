from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class PaymentStatus(PyEnum):
    pending = "pending"
    completed = "completed"
    canceled = "canceled"
    failed = "failed"


class Payment(BaseModel):
    __tablename__ = "payments"

    enrollment_id = Column(
        String(36), ForeignKey("batch_enrollments.id"), nullable=False
    )
    amount = Column(Float, nullable=False)
    currency = Column(String(5), nullable=False)
    method = Column(String(50), nullable=True)
    status = Column(Enum(PaymentStatus), nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    transaction_id = Column(String(500), nullable=True)
    checkout_url = Column(String(500), nullable=True)
    receipt_url = Column(String(500), nullable=True)

    # Relationships
    enrollment = relationship("BatchEnrollment", back_populates="payments")
    subscription = relationship("Subscription", back_populates="payment", uselist=False)
