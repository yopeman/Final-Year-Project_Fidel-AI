from enum import Enum as PyEnum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class PlanType(PyEnum):
    free = "free"
    premium = "premium"

class SubscriptionStatus(PyEnum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"

class Subscription(BaseModel):
    __tablename__ = "subscriptions"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    plan_type = Column(Enum(PlanType), nullable=False, default=PlanType.free)
    status = Column(Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.active)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True) # Now explicitly optional
    features = Column(JSON, nullable=True, default=[]) # e.g., ["modules", "community"]
    payment_id = Column(String(36), ForeignKey("payments.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="subscription")
    payment = relationship("Payment", back_populates="subscription")
