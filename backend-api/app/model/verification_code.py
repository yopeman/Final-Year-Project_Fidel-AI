from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel


class VerificationCode(BaseModel):
    __tablename__ = "verification_codes"

    email = Column(String(100), nullable=False, index=True)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Integer, default=0)  # 0 = not used, 1 = used

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="verification_codes")
