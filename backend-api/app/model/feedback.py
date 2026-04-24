from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Feedback(BaseModel):
    __tablename__ = "feedbacks"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    context = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    rate = Column(Integer, nullable=False)  # 1-5
    is_read = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="feedbacks")
