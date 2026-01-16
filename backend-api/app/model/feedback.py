from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Feedback(BaseModel):
    __tablename__ = "feedbacks"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    context = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    rate = Column(Integer, nullable=False)  # 1-5

    # Relationships
    user = relationship("User", back_populates="feedbacks")
